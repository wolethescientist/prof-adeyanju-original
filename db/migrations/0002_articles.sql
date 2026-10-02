-- Awards, press items and initiatives become articles with their own pages.
--
-- Written to be re-runnable (IF NOT EXISTS / guarded constraints), because it
-- is applied automatically by db/migrate.mts at build time and a failed
-- deploy must be able to simply try again.
--
-- Existing rows get a slug derived from their title before the column is made
-- NOT NULL: lower-case words joined by hyphens, cut at a word boundary within
-- 60 characters (the same rule as lib/cms/slug.ts), and numbered in display
-- order when two collide (award, award-2, ...).

ALTER TABLE "press_items" ALTER COLUMN "href" DROP NOT NULL;--> statement-breakpoint

ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "body" text;--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "gallery_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "attachment_id" uuid;--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "recipient" text DEFAULT 'gbb' NOT NULL;--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "awarded_by" text;--> statement-breakpoint
ALTER TABLE "awards" ADD COLUMN IF NOT EXISTS "awarded_on" date;--> statement-breakpoint

ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "body" text;--> statement-breakpoint
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "gallery_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "attachment_id" uuid;--> statement-breakpoint

ALTER TABLE "press_items" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
ALTER TABLE "press_items" ADD COLUMN IF NOT EXISTS "body" text;--> statement-breakpoint
ALTER TABLE "press_items" ADD COLUMN IF NOT EXISTS "gallery_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "press_items" ADD COLUMN IF NOT EXISTS "attachment_id" uuid;--> statement-breakpoint
ALTER TABLE "press_items" ADD COLUMN IF NOT EXISTS "published_on" date;--> statement-breakpoint

WITH base AS (
  SELECT id, position,
         COALESCE(NULLIF(CASE WHEN length(full_slug) <= 60 THEN full_slug
              ELSE trim(both '-' FROM regexp_replace(left(full_slug, 61), '-[^-]*$', '')) END, ''), 'award') AS b
  FROM (SELECT id, position, trim(both '-' FROM regexp_replace(lower("award"), '[^a-z0-9]+', '-', 'g')) AS full_slug
        FROM "awards" WHERE "slug" IS NULL) AS titles
), numbered AS (
  SELECT id, b, row_number() OVER (PARTITION BY b ORDER BY position, id) AS n FROM base
)
UPDATE "awards" t SET "slug" = CASE WHEN n = 1 THEN b ELSE b || '-' || n END
FROM numbered WHERE t.id = numbered.id;--> statement-breakpoint

WITH base AS (
  SELECT id, position,
         COALESCE(NULLIF(CASE WHEN length(full_slug) <= 60 THEN full_slug
              ELSE trim(both '-' FROM regexp_replace(left(full_slug, 61), '-[^-]*$', '')) END, ''), 'initiative') AS b
  FROM (SELECT id, position, trim(both '-' FROM regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')) AS full_slug
        FROM "initiatives" WHERE "slug" IS NULL) AS titles
), numbered AS (
  SELECT id, b, row_number() OVER (PARTITION BY b ORDER BY position, id) AS n FROM base
)
UPDATE "initiatives" t SET "slug" = CASE WHEN n = 1 THEN b ELSE b || '-' || n END
FROM numbered WHERE t.id = numbered.id;--> statement-breakpoint

WITH base AS (
  SELECT id, position,
         COALESCE(NULLIF(CASE WHEN length(full_slug) <= 60 THEN full_slug
              ELSE trim(both '-' FROM regexp_replace(left(full_slug, 61), '-[^-]*$', '')) END, ''), 'press') AS b
  FROM (SELECT id, position, trim(both '-' FROM regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')) AS full_slug
        FROM "press_items" WHERE "slug" IS NULL) AS titles
), numbered AS (
  SELECT id, b, row_number() OVER (PARTITION BY b ORDER BY position, id) AS n FROM base
)
UPDATE "press_items" t SET "slug" = CASE WHEN n = 1 THEN b ELSE b || '-' || n END
FROM numbered WHERE t.id = numbered.id;--> statement-breakpoint

ALTER TABLE "awards" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "initiatives" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "press_items" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'awards_attachment_id_media_id_fk') THEN
    ALTER TABLE "awards" ADD CONSTRAINT "awards_attachment_id_media_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'initiatives_attachment_id_media_id_fk') THEN
    ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_attachment_id_media_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'press_items_attachment_id_media_id_fk') THEN
    ALTER TABLE "press_items" ADD CONSTRAINT "press_items_attachment_id_media_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'awards_slug_unique') THEN
    ALTER TABLE "awards" ADD CONSTRAINT "awards_slug_unique" UNIQUE("slug");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'initiatives_slug_unique') THEN
    ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_slug_unique" UNIQUE("slug");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'press_items_slug_unique') THEN
    ALTER TABLE "press_items" ADD CONSTRAINT "press_items_slug_unique" UNIQUE("slug");
  END IF;
END $$;
