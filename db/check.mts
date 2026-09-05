/**
 * Reports what DATABASE_URL actually points at, and what is in it.
 *
 * Run this against the exact connection string an environment uses when a
 * deployment reports missing tables — it answers "which database am I really
 * talking to, and does it have the schema?" in one step.
 *
 *   npm run db:check
 *   DATABASE_URL='<the url from Vercel>' npm run db:check
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

const { pool, describeConnection } = await import("./index");

const EXPECTED = [
  "users", "sessions", "media", "site_images",
  "stats", "impact_stats", "marquee_items", "timeline_entries",
  "initiatives", "research_areas", "education_entries", "honours",
  "awards", "press_items", "glance_items",
];

async function main() {
  const where = describeConnection();
  console.log("\nConnection");
  console.log("  host:      ", where.host, where.pooled ? "(pooled ✓)" : "(not the -pooler host)");
  console.log("  database:  ", where.database);
  console.log("  user:      ", where.user);

  const client = await pool.connect();
  try {
    const meta = await client.query(
      "SELECT current_database() AS db, current_user AS usr, current_schema() AS schema, current_setting('search_path') AS search_path"
    );
    const m = meta.rows[0];
    console.log("\nServer reports");
    console.log("  current_database:", m.db);
    console.log("  current_user:    ", m.usr);
    console.log("  current_schema:  ", m.schema);
    console.log("  search_path:     ", m.search_path);

    const found = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    const names: string[] = found.rows.map((r) => r.table_name);
    const missing = EXPECTED.filter((t) => !names.includes(t));

    console.log(`\nTables in public schema: ${names.length}`);
    if (missing.length > 0) {
      console.log("  MISSING:", missing.join(", "));
      console.log("\n  → This database does not have the CMS schema. Apply it here:");
      console.log("      psql '<this DATABASE_URL>' -f db/migrations/0000_initial_cms_schema.sql");
      console.log("      psql '<this DATABASE_URL>' -f db/content-snapshot.sql");
      console.log("\n  If you already ran those, they went to a different Neon branch");
      console.log("  or project than the URL you just used here.\n");
      process.exitCode = 1;
      return;
    }

    console.log("  all 15 CMS tables present ✓");

    console.log("\nContent");
    for (const table of ["awards", "press_items", "timeline_entries", "honours", "media", "site_images", "users"]) {
      const c = await client.query(`SELECT count(*)::int AS n FROM "${table}"`);
      console.log(`  ${table.padEnd(18)} ${c.rows[0].n}`);
    }

    const users = await client.query("SELECT count(*)::int AS n FROM users");
    if (users.rows[0].n === 0) {
      console.log("\n  No accounts yet — create one with:");
      console.log("    npm run cms:user -- --email=you@example.com --password='…' --role=admin");
    }
    console.log("\nThis database is ready to build against.\n");
  } finally {
    client.release();
  }
}

await main()
  .catch((error) => {
    console.error("\nCheck failed:\n", error instanceof Error ? error.message : error, "\n");
    process.exitCode = 1;
  })
  .finally(() => pool.end());
