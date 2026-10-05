-- Event registrations: people who sign up on the /register page. The media team
-- sees them in the site manager and downloads them as a CSV.
--
-- Re-runnable (IF NOT EXISTS), because db/migrate.mts applies it automatically
-- at build time and a failed deploy must be able to simply try again. It only
-- adds a table, so the version of the site that is live while this deploy
-- builds is unaffected.

CREATE TABLE IF NOT EXISTS "event_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_registrations_event_email_unique" UNIQUE("event","email")
);
