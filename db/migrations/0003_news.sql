-- News & Awards: one table for everything the media team announces.
--
-- Awards and press coverage are copied in, keeping their ids, page addresses,
-- photos, galleries and PDFs, so nothing is re-entered and shared links keep
-- working (the site redirects /recognition/... to /news/...). The old tables
-- are left alone: the version of the site that is live while this deploy
-- builds still reads them.
--
-- Written to be re-runnable (IF NOT EXISTS, guarded constraints, rows copied
-- only once), because db/migrate.mts applies it automatically at build time
-- and a failed deploy must be able to simply try again.

CREATE TABLE IF NOT EXISTS "news_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"body" text,
	"gallery_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"attachment_id" uuid,
	"title" text NOT NULL,
	"category" text DEFAULT 'announcement' NOT NULL,
	"happened_on" date,
	"year" text,
	"summary" text,
	"source" text,
	"href" text,
	"recipient" text,
	"image_id" uuid,
	"featured" boolean DEFAULT true NOT NULL,
	CONSTRAINT "news_items_slug_unique" UNIQUE("slug")
);--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_items_attachment_id_media_id_fk') THEN
    ALTER TABLE "news_items" ADD CONSTRAINT "news_items_attachment_id_media_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_items_image_id_media_id_fk') THEN
    ALTER TABLE "news_items" ADD CONSTRAINT "news_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

-- Awards and press, interleaved newest first by the date they carry (an award
-- that only recorded a year counts as 1 January of that year). A press item
-- whose address an award already uses gets "-press" added.
WITH incoming AS (
  SELECT a.id, a.published, a.created_at, a.updated_at, a.slug, a.body, a.gallery_ids,
         a.attachment_id, a.award AS title, 'award'::text AS category,
         a.awarded_on AS happened_on, a.year, a.detail AS summary,
         a.awarded_by AS source, NULL::text AS href, a.recipient, a.image_id,
         COALESCE(a.awarded_on,
                  CASE WHEN a.year ~ '^[0-9]{4}$' THEN make_date(a.year::int, 1, 1) END) AS sort_date,
         a.position AS old_position, 0 AS from_table
  FROM "awards" a
  UNION ALL
  SELECT p.id, p.published, p.created_at, p.updated_at,
         CASE WHEN EXISTS (SELECT 1 FROM "awards" x WHERE x.slug = p.slug)
              THEN p.slug || '-press' ELSE p.slug END,
         p.body, p.gallery_ids, p.attachment_id, p.title, 'press'::text,
         p.published_on, NULL::text, p.description, p.outlet, p.href, NULL::text, p.image_id,
         p.published_on, p.position, 1
  FROM "press_items" p
), fresh AS (
  SELECT * FROM incoming i WHERE NOT EXISTS (SELECT 1 FROM "news_items" n WHERE n.id = i.id)
), ordered AS (
  SELECT fresh.*,
         row_number() OVER (ORDER BY sort_date DESC NULLS LAST, from_table, old_position, id) - 1
           + COALESCE((SELECT max("position") + 1 FROM "news_items"), 0) AS new_position
  FROM fresh
)
INSERT INTO "news_items" ("id", "position", "published", "created_at", "updated_at", "slug", "body",
                          "gallery_ids", "attachment_id", "title", "category", "happened_on", "year",
                          "summary", "source", "href", "recipient", "image_id", "featured")
SELECT id, new_position, published, created_at, updated_at, slug, body,
       gallery_ids, attachment_id, title, category, happened_on, year,
       summary, source, href, recipient, image_id, true
FROM ordered;
