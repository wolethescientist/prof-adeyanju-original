-- Removes the CMS from a database it was applied to by mistake.
--
-- Drops ONLY the 16 tables and the one enum this CMS created. Everything else
-- in the database is left alone — verified against the target that no foreign
-- key outside these tables points into them, so nothing cascades outward.
--
-- Wrapped in a transaction: it either all succeeds or nothing changes.
--
--   psql '<the wrong database url>' -v ON_ERROR_STOP=1 -f db/rollback-cms-schema.sql

BEGIN;

-- 1. tables that reference other CMS tables, dropped first
DROP TABLE IF EXISTS "sessions";
DROP TABLE IF EXISTS "awards";
DROP TABLE IF EXISTS "news_items";
DROP TABLE IF EXISTS "initiatives";
DROP TABLE IF EXISTS "press_items";
DROP TABLE IF EXISTS "site_images";

-- 2. standalone content tables
DROP TABLE IF EXISTS "education_entries";
DROP TABLE IF EXISTS "glance_items";
DROP TABLE IF EXISTS "honours";
DROP TABLE IF EXISTS "impact_stats";
DROP TABLE IF EXISTS "marquee_items";
DROP TABLE IF EXISTS "research_areas";
DROP TABLE IF EXISTS "stats";
DROP TABLE IF EXISTS "timeline_entries";

-- 3. referenced by the above, so dropped last
DROP TABLE IF EXISTS "media";
DROP TABLE IF EXISTS "users";

-- 4. the enum this CMS defined. Named user_role — distinct from the
--    other application's "Role" type, which is untouched.
DROP TYPE IF EXISTS "public"."user_role";

COMMIT;
