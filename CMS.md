# Site manager (CMS)

The public site reads all of its content from Postgres. The media team signs in
at **`/admin`** and edits it there; saving refreshes the affected public pages
immediately, with no redeploy and no developer involved.

---

## What the team can edit

Every section that already existed on the site is editable. The sidebar — and
the **section dropdown** at the top of each screen — lists them in three groups:

| Group | Section | Appears on |
|---|---|---|
| Achievements | Awards & Achievements | `/recognition` |
| Achievements | Press coverage | `/recognition`, home |
| Achievements | Initiatives | `/impact`, home |
| Achievements | Impact numbers | `/impact` |
| Achievements | Personal honours | `/recognition` |
| Profile | Career journey | `/journey` |
| Profile | Research areas | `/research`, home |
| Profile | Education | `/about` |
| Profile | At a glance | `/about` |
| Home page | Headline numbers | home |
| Home page | Scrolling keywords | home |
| Page images | Page images | home, `/impact`, `/research` |

Plus an **Images** library, and **Team** (administrators only).

**Page images** is a fixed list — the photographs built into the page designs
(the hero portrait, the team photograph, and so on). The team chooses which
uploaded image fills each place, but cannot add or remove slots, because the
layouts define them. Leaving a slot empty falls back to the photograph the site
originally shipped with, so a page can never end up with a hole in it.

Every entry can be reordered (▲ ▼), hidden from the public site without being
deleted (the eye icon), edited, or removed. Awards, press items and initiatives
can carry an uploaded image.

Every section also has an optional **Description**. For press coverage,
education and personal honours it appears on the website beneath the entry;
for the headline numbers, impact numbers, at-a-glance rows and scrolling
keywords the design has nowhere to show it, so it serves as a note for the
team. The field's help text says which is which.

### Roles

- **Editor** — adds and edits all content and images.
- **Administrator** — the same, plus adding, suspending and removing team
  members at `/admin/team`.

Suspending someone ends their active sessions immediately.

---

## Running it locally

```bash
cp .env.example .env.local     # then edit the values (see below)
npm install
npm run db:up                  # starts Postgres in Docker
npm run db:push                # creates the tables
npm run db:seed                # loads the current site content + first admin
npm run dev
```

Sign in at <http://localhost:3000/admin/login> with the `ADMIN_EMAIL` and
`ADMIN_PASSWORD` you put in `.env.local`.

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | The only value that differs between environments. |
| `AUTH_SECRET` | Signs the session cookie. 32+ characters. `openssl rand -base64 32`. Changing it signs everyone out. |
| `DATABASE_SSL` | Set to `disable` only for a remote database without TLS. TLS is automatic for any non-local host. |
| `ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD` | Read by `npm run db:seed` only. Remove them once seeded. |

---

## Deploying

The app talks to Postgres over a standard connection, so **moving between Neon
and the Docker container is a change of `DATABASE_URL` and nothing else** — no
code edits, no second driver.

### The SQL files

| File | What it is |
|---|---|
| `db/migrations/0000_initial_cms_schema.sql` | Creates all 15 tables. Run first. |
| `db/migrations/0001_add_description_fields.sql` | Adds the optional Description column. Run second. |
| `db/content-snapshot.sql` | Every content row plus the uploaded images. Run last. |

`content-snapshot.sql` deliberately excludes `users` and `sessions`, so no
password hash lives in a file — create the first account with `npm run cms:user`
after restoring.

You can paste both into Neon's SQL Editor, or pipe them in:

```bash
psql '<neon pooled url>' -v ON_ERROR_STOP=1 -f db/migrations/0000_initial_cms_schema.sql
psql '<neon pooled url>' -v ON_ERROR_STOP=1 -f db/content-snapshot.sql
```

`npm run db:push` does the same thing from the schema directly, if you'd rather
not handle SQL by hand.

> **The database must exist before the first deploy.** The public pages are
> statically rendered from their content at build time, so `npm run build`
> queries the database — against an empty or unreachable one it fails. Order is:
> create the Neon database → run the two files → set the environment variables →
> deploy.

### Vercel preview (Neon)

1. Create a Neon project and copy the **pooled** connection string (the host
   contains `-pooler`).
2. In Vercel → Settings → Environment Variables, set `DATABASE_URL` and
   `AUTH_SECRET`.
3. Load the database **before** deploying — see [The SQL files](#the-sql-files)
   — then create the first account:
   ```bash
   DATABASE_URL='<neon pooled url>' npm run cms:user -- \
     --email=test@gbb.gov.ng --name='Galaxy Backbone Media Team' \
     --password='<a strong one>' --role=admin
   ```
4. Deploy.

### Self-hosted (Docker Postgres)

`docker-compose.yml` and `docker/postgres.Dockerfile` define the database. It is
pinned to Postgres 17 to match the major version Neon runs, so a dump taken from
the preview restores without a version jump:

```bash
pg_dump '<neon pooled url>' -Fc -f cms.dump      # from Neon
docker compose up -d db
pg_restore -d '<docker url>' --no-owner cms.dump # into the container
```

Then point the app's `DATABASE_URL` at the container and restart it.

Back the volume up like any other database — **uploaded images live in
Postgres**, so a database backup is a complete backup of the site's content.

---

## How it works

- **Content** — one table per section in `db/schema.ts`. They share `position`
  (manual ordering) and `published` (hide without deleting).
- **The registry** — `lib/cms/registry.ts` describes each section: its table,
  its fields, and which public pages to refresh when it changes. One generic set
  of screens renders all ten, so adding a section later means adding one entry
  here, not building another page.
- **Publishing** — public pages are statically rendered and revalidated on
  demand. Saving calls `revalidatePath` for that section's pages, so edits go
  live at once; a 5-minute background revalidation is a safety net.
- **Images** — stored as rows in Postgres and served from `/api/media/[id]`
  with the file's checksum in the URL, so they cache permanently yet update the
  moment the file changes. Storing them in the database is what lets the same
  code run on Vercel's read-only filesystem and on your own server without a
  separate blob service. Uploads are capped at 8MB, and each one is resized to
  fit within 2560px, re-encoded and stripped of camera metadata (which also
  removes GPS coordinates from phone photos) before it is stored — a 4.4MB
  photo straight off a phone lands in the database at about 1.2MB. `next/image`
  then resizes and re-formats again on delivery.

  The cache-busting checksum sits in the URL path rather than a query string so
  that `images.localPatterns` in `next.config.ts` can pin `search: ""`, which
  stops anyone flooding the image optimizer's cache with invented query
  strings.
- **Sessions** — server-side rows in the `sessions` table; the cookie carries
  only a signed session id, so revoking access takes effect on the next request.
  Passwords are hashed with bcrypt (12 rounds). `proxy.ts` (Next 16's renamed
  middleware) does a cheap signature check before pages render; the admin layout
  does the authoritative database check.

### Useful commands

| Command | Does |
|---|---|
| `npm run db:up` / `db:down` | Start / stop the Docker database |
| `npm run db:push` | Apply `db/schema.ts` to the database |
| `npm run db:generate` / `db:migrate` | Versioned migrations, for production changes |
| `npm run db:studio` | Browse the data in Drizzle Studio |
| `npm run db:seed` | Load the site's content (safe to re-run; skips non-empty tables) |
| `npm run cms:user -- --email=… --password=… --role=admin` | Create an account or reset a password from the terminal |
