import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * A single Postgres client that works in both deployment targets.
 *
 * We deliberately use the standard `pg` driver over TCP rather than a
 * vendor-specific serverless driver: Neon speaks plain Postgres, so the only
 * thing that changes between "Neon on Vercel" today and "the Docker container
 * on our own server" later is the value of DATABASE_URL. No code edits, no
 * second driver to keep in sync.
 */
function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in, " +
        "or run `docker compose up -d db` for a local database."
    );
  }
  return url;
}

/** Neon (and most managed Postgres) require TLS; a local container does not. */
function sslConfig(url: string) {
  if (process.env.DATABASE_SSL === "disable") return false;
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "db" || host === "";
  if (isLocal) return false;
  /* Managed providers terminate TLS with a chain Node does not ship, so we
     encrypt without demanding a verifiable CA. */
  return { rejectUnauthorized: false };
}

function createPool() {
  const url = connectionString();
  return new Pool({
    connectionString: url,
    ssl: sslConfig(url),
    /* Serverless functions get many short-lived instances, so each one keeps a
       small pool; a long-running Node server can afford more. */
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: 30_000,
    /* Generous, because a serverless Postgres compute that has scaled to zero
       can take 10-20s to wake for the first connection — a build must wait for
       that rather than fail. */
    connectionTimeoutMillis: 30_000,
  });
}

/* Cached across hot reloads in dev and across warm invocations in production,
   so we do not open a new pool per request. */
const globalForDb = globalThis as unknown as { __cmsPool?: Pool };
const pool = globalForDb.__cmsPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.__cmsPool = pool;

/** Host and database name of whatever DATABASE_URL currently points at. */
export function describeConnection() {
  try {
    const url = new URL(connectionString());
    return {
      host: url.hostname,
      database: url.pathname.replace(/^\//, "") || "(default)",
      user: url.username || "(default)",
      pooled: url.hostname.includes("-pooler"),
    };
  } catch {
    return { host: "(unparseable)", database: "?", user: "?", pooled: false };
  }
}

/*
 * Postgres reports a missing table as 42P01 with only the relation name, and
 * Drizzle re-wraps that in its own error — so a deployment log ends up saying
 * a table is missing without saying which database it looked in. That is the
 * one fact needed to fix it, since the usual cause is the schema having been
 * applied to a different Neon branch or project than this environment points
 * at.
 *
 * We print the diagnosis ourselves rather than enriching the thrown error,
 * because whatever we throw gets wrapped again before anyone sees it.
 */
let schemaWarningShown = false;

function pgErrorCode(error: unknown): string | undefined {
  let current = error;
  for (let depth = 0; depth < 5 && current; depth++) {
    const code = (current as { code?: string }).code;
    if (typeof code === "string") return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

const originalQuery = pool.query.bind(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pool as any).query = async (...args: unknown[]) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (originalQuery as any)(...args);
  } catch (error) {
    if (pgErrorCode(error) === "42P01" && !schemaWarningShown) {
      schemaWarningShown = true;
      const at = describeConnection();
      console.error(
        [
          "",
          "  ┌─ CMS database schema is missing ────────────────────────────",
          `  │ Connected to : ${at.user}@${at.host}/${at.database}`,
          `  │ Pooled host  : ${at.pooled ? "yes" : "NO — expected a -pooler host on Neon"}`,
          "  │",
          "  │ The connection works, but this database has no CMS tables.",
          "  │ Apply them to THIS database:",
          "  │   psql '<this DATABASE_URL>' -f db/migrations/0000_initial_cms_schema.sql",
          "  │   psql '<this DATABASE_URL>' -f db/content-snapshot.sql",
          "  │",
          "  │ Already ran those? Then they went to a different Neon branch",
          "  │ or project. Check with:  npm run db:check",
          "  └─────────────────────────────────────────────────────────────",
          "",
        ].join("\n")
      );
    }
    throw error;
  }
};

export const db = drizzle(pool, { schema });
export { pool, schema };
