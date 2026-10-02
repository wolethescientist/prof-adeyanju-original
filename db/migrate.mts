/**
 * Applies any SQL migrations in db/migrations that this database has not had
 * yet, in order, recording each one in a `cms_migrations` table.
 *
 * It runs before every build (see "build" in package.json), so a deploy brings
 * its own database changes with it — nobody has to remember to paste SQL into
 * Neon first, and the build never queries columns that do not exist yet.
 *
 *   npm run db:migrate
 *
 * Each file runs in its own transaction under an advisory lock, so two builds
 * starting at once cannot apply the same file twice. Files from 0002 on are
 * written to be re-runnable as well.
 *
 * Databases set up before this runner existed had 0000 and 0001 applied by
 * hand (or got the same tables from `db:push`), so they have the tables but no
 * record of them. Those two are recorded as applied, not re-run, when what
 * they create is already there.
 */
import { config } from "dotenv";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

config({ path: ".env.local" });
config({ path: ".env" });

const { pool } = await import("./index");

const dir = path.join(process.cwd(), "db", "migrations");
/* Any constant works; it only has to be the same for every build. */
const LOCK_ID = 74_211_903;

/** What each hand-applied migration created, to recognise it on an old database. */
const BASELINE: Record<string, string> = {
  "0000_initial_cms_schema.sql": `SELECT to_regclass('public.users') IS NOT NULL AS present`,
  "0001_add_description_fields.sql": `SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stats' AND column_name = 'description'
  ) AS present`,
};

async function main() {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS cms_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

    const applied = new Set(
      (await client.query<{ name: string }>("SELECT name FROM cms_migrations")).rows.map(
        (row) => row.name
      )
    );
    const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) continue;

      const baseline = BASELINE[file];
      if (baseline) {
        const { rows } = await client.query<{ present: boolean }>(baseline);
        if (rows[0]?.present) {
          await client.query("INSERT INTO cms_migrations (name) VALUES ($1)", [file]);
          console.log(`[migrate] ${file} — already in place, recorded`);
          continue;
        }
      }

      const sql = await readFile(path.join(dir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO cms_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(
          `${file} failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      console.log(`[migrate] ${file} — applied`);
      ran++;
    }

    if (ran === 0) console.log("[migrate] database is up to date");
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    client.release();
  }
}

await main()
  .catch((error) => {
    console.error(`[migrate] ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
