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
    connectionTimeoutMillis: 10_000,
  });
}

/* Cached across hot reloads in dev and across warm invocations in production,
   so we do not open a new pool per request. */
const globalForDb = globalThis as unknown as { __cmsPool?: Pool };
const pool = globalForDb.__cmsPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.__cmsPool = pool;

export const db = drizzle(pool, { schema });
export { pool, schema };
