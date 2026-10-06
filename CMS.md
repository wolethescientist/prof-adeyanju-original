# Site manager (CMS)

The public site reads all of its content from Postgres. The media team signs in
at **`/admin`** and edits it there; saving refreshes the affected public pages
immediately, with no redeploy and no developer involved.

---

## What the team can edit

### News & Awards

Everything the team announces goes in one place: **News & Awards**. Choose
**Post an update** and answer one question first, *What kind of update is
this?*

| Kind | Use it for |
|---|---|
| Award | An award given to Prof. Adeyanju or to Galaxy Backbone |
| Invitation | Invited, selected or appointed to speak or take part in an event |
| Inaugural lecture | The inaugural lecture: the announcement and news about it |
| In the press | An article or interview about him |
| Other news | Anything else worth announcing |

Each update has its own page on the website and a card on the **News & Awards**
page (`/news`). Visitors can filter the page by kind.

Fill in the **cover photo**, a **headline** and a short **summary** (both shown
on the card), then the **full story** in the editor (headings, bold, lists,
quotes, links), **more photos** for the gallery, and a **PDF** such as a
certificate, programme, press release or scanned clipping. The side panel asks
only what fits the kind: *Awarded to* for an award, *Hosted by* for a lecture,
*Publication* for press. Photos and PDFs are uploaded right there in the form,
by dropping them in or choosing a file. You can also pick something already in
the Library, but you never have to leave the page to upload.

On the page, visitors can click any photo to see it full size, download the
PDF, and copy a link to share. Photos are shown whole, as they were uploaded,
with nothing behind them.

**Latest on the home page.** The newest updates appear in a *Latest news &
awards* strip just under the top of the home page, each marked **New** for two
weeks after it is posted. The switch *Show in "Latest" on the home page* (on by
default) controls which updates can appear there.

New updates go to the **top** of the list. The ▲ ▼ buttons change the order.

An update's page address is made from its headline when it is first saved and
does not change afterwards, so links that have been shared keep working even if
the headline is edited. Links to the old Recognition page and to the old award
and press pages redirect to News & Awards.

### Everything else

| Group | Section | Appears on |
|---|---|---|
| Impact page | Initiatives | `/impact`, home (each has its own page) |
| Impact page | Impact numbers | `/impact` |
| About & profile | Career journey | `/journey` |
| About & profile | Research areas | `/research`, home |
| About & profile | Education | `/about` |
| About & profile | Personal honours | `/about` |
| About & profile | At a glance | `/about` |
| Home page | Home page numbers | home |
| Home page | Keywords | home |
| Photos | Photos on pages | home, `/impact`, `/research` |

Plus the **Library** of every uploaded photo and PDF, and **Team**
(administrators only).

**Photos on pages** is a fixed list: the photographs built into the page
designs (the main portrait, the team photograph, and so on). The team chooses
which uploaded photo fills each place, but cannot add or remove places, because
the layouts define them. Leaving a place empty falls back to the photograph the
site originally shipped with, so a page can never end up with a hole in it.

Every entry can be reordered (▲ ▼), hidden from the public site without being
deleted (the eye icon), edited, or removed.

Most sections also have an optional **Description**. For education and
personal honours it appears on the website beneath the entry; for the home page
numbers, impact numbers, at-a-glance rows and keywords the design has nowhere
to show it, so it serves as a note for the team. The field's help text says
which is which.

### Roles

- **Editor** — adds and edits all content, photos and PDFs.
- **Administrator** — the same, plus adding, suspending and removing team
  members at `/admin/team`.

Suspending someone ends their active sessions immediately.

---

## Search engines

The site is set up to be found on Google and to look right when shared.

- **`/sitemap.xml`** lists every public page, including each news post and
  initiative, and is refreshed when the team saves. **`/robots.txt`** points to
  it and keeps `/admin` out of search results.
- Every page has its own title, description and canonical address. Posts also
  carry structured data (article, breadcrumbs) and the home and About pages
  describe Prof. Adeyanju as a person, with links to his LinkedIn, Google
  Scholar and Galaxy Backbone profiles.
- Shared links show the post's cover photo, or a branded card when a post has
  none.

Two settings, both on Vercel under **Settings → Environment Variables**:

| Variable | What for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.ibrahimadeyanju.com`. Without it the site assumes this same address, so set it only if the domain changes. |
| `GOOGLE_SITE_VERIFICATION` | Only for Search Console's "HTML tag" verification. The DNS method needs nothing. |

To register with Google: add the domain at <https://search.google.com/search-console>
as a **Domain** property, verify it with the DNS record Google gives, then
submit `sitemap.xml` under **Sitemaps** and use **URL Inspection → Request
indexing** on the home page and newest posts. Make sure the non-`www` address
redirects to `www` (Vercel → Settings → Domains), so Google sees one address.

Writing for search: give every post a clear headline, a one or two sentence
summary and a real story, and describe photos when uploading them. Links from
other sites (Galaxy Backbone, LinkedIn, the outlets that covered him) matter
most.

---

## Event registration

`/register` is a sign-up page for the Inaugural Lecture: visitors give their
name, phone number and email. Registrations are saved in the site's own
database. It closes by itself at the end of the day of the event, and one
email address can register once.

**Seeing who registered:** open **Registrations** in the site manager's side
menu. It lists everyone, newest first, and **Download CSV** saves the list to
open in Excel or Google Sheets (to put it in a Google Sheet: File → Import →
Upload). A registration can be deleted there too, for a typo or a test.

The event's name, date and venue are in `lib/event.ts`; change them there for
the next event.

**Linking to it from the announcement:** edit the lecture's post in News &
Awards and set **Link to the event page** to
`https://www.ibrahimadeyanju.com/register`. The post then shows a
**Register to attend** button.

---

## Running it locally

```bash
cp .env.example .env.local     # then edit the values (see below)
npm install
npm run db:up                  # starts Postgres in Docker
npm run db:migrate             # creates the tables
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

### Database changes apply themselves

`npm run build` runs `db/migrate.mts` before `next build`. It applies any file
in `db/migrations/` the database has not had yet, in order, and records each in
a `cms_migrations` table — so **a deploy brings its own database changes**, and
nobody has to paste SQL into Neon first. Each file runs in a transaction under
an advisory lock, and the files from `0002` on are safe to run twice.

Databases set up before the runner existed had `0000` and `0001` applied by
hand; the runner recognises those by what they created and records them as
applied rather than running them again.

This relies on Vercel using the project's `build` script (its default for
Next.js). If the project's Build Command has been overridden to `next build`,
set it back to `npm run build`, or run `DATABASE_URL='<url>' npm run db:migrate`
yourself before deploying. Otherwise the build fails — safely: the live site
stays on the previous version.

Migrations are written to be additive, so the version of the site that is
already live keeps working against the updated database while the new one
builds. Keep it that way: add columns, don't rename or drop them in the same
deploy that stops using them.

### The SQL files

| File | What it is |
|---|---|
| `db/migrations/0000_initial_cms_schema.sql` | Creates the first 15 tables. |
| `db/migrations/0001_add_description_fields.sql` | Adds the optional Description column. |
| `db/migrations/0002_articles.sql` | Turns awards, press and initiatives into articles: page addresses (filled in for existing rows), story, gallery, PDF, award recipient and dates. |
| `db/migrations/0004_event_registrations.sql` | Adds the table that holds event registrations. |
| `db/migrations/0003_news.sql` | Adds News & Awards. Copies every award and press item into it, keeping their page addresses, photos, galleries and PDFs. The old `awards` and `press_items` tables are left in place for one deploy and can be dropped in a later one. |
| `db/content-snapshot.sql` | Every content row as of the first launch, plus its images. |

`content-snapshot.sql` deliberately excludes `users` and `sessions`, so no
password hash lives in a file — create the first account with `npm run cms:user`
after restoring. It was taken before `0001`, so it loads straight after `0000`;
the migration runner then brings the database up to date:

```bash
psql '<neon pooled url>' -v ON_ERROR_STOP=1 -f db/migrations/0000_initial_cms_schema.sql
psql '<neon pooled url>' -v ON_ERROR_STOP=1 -f db/content-snapshot.sql
DATABASE_URL='<neon pooled url>' npm run db:migrate
```

> **The database must exist before the first deploy.** The public pages are
> statically rendered from their content at build time, so `npm run build`
> queries the database — against an unreachable one it fails.

### Vercel (Neon)

1. Create a Neon project and copy the **pooled** connection string (the host
   contains `-pooler`).
2. In Vercel → Settings → Environment Variables, set `DATABASE_URL` and
   `AUTH_SECRET`.
3. Load the content — see [The SQL files](#the-sql-files) — then create the
   first account:
   ```bash
   DATABASE_URL='<neon pooled url>' npm run cms:user -- \
     --email=test@gbb.gov.ng --name='Galaxy Backbone Media Team' \
     --password='<a strong one>' --role=admin
   ```
4. Deploy.

### Self-hosted (Docker Postgres)

`docker-compose.yml` and `docker/postgres.Dockerfile` define the database. It is
pinned to Postgres 17 to match the major version Neon runs, so a dump taken from
Neon restores without a version jump:

```bash
pg_dump '<neon pooled url>' -Fc -f cms.dump      # from Neon
docker compose up -d db
pg_restore -d '<docker url>' --no-owner cms.dump # into the container
```

Then point the app's `DATABASE_URL` at the container and restart it.

Back the volume up like any other database — **uploaded photos and PDFs live in
Postgres**, so a database backup is a complete backup of the site's content.

---

## How it works

- **Content** — one table per section in `db/schema.ts`. They share `position`
  (manual ordering) and `published` (hide without deleting). Awards, press
  items and initiatives also share the article columns: `slug` (the page
  address), `body`, `gallery_ids` and `attachment_id`.
- **The registry** — `lib/cms/registry.ts` describes each section: its table,
  its fields, and which public pages to refresh when it changes. One generic set
  of screens renders all of them, so adding a section later means adding one
  entry here, not building another page. A section with `article` set gets the
  two-column article editor and its own public pages.
- **Article pages** — `app/lib/articles.ts` reads them;
  `app/components/article/ArticleLayout.tsx` lays every one out. Pages are
  generated ahead of time for every published entry; one added later renders
  on its first visit.
- **The story** — written in a TipTap editor (`app/admin/_components/editor/`)
  that uses the same typeface and spacing as the public page. It is stored as
  HTML and cleaned on save and again on render (`lib/cms/rich-text.ts`) down to
  what the toolbar can produce — so formatting pasted from Word or a website,
  scripts and embeds never reach the site.
- **Publishing** — public pages are statically rendered and revalidated on
  demand. Saving calls `revalidatePath` for that section's pages (and every
  article page in it, since each lists its neighbours), so edits go live at
  once; a 5-minute background revalidation is a safety net.
- **Photos and PDFs** — stored as rows in Postgres and served from
  `/api/media/[id]` with the file's checksum in the URL, so they cache
  permanently yet update the moment the file changes. Storing them in the
  database is what lets the same code run on Vercel's read-only filesystem and
  on your own server without a separate blob service.

  Photos are capped at 8MB, and each one is resized to fit within 2560px,
  re-encoded and stripped of camera metadata (which also removes GPS
  coordinates from phone photos) before it is stored — a 4.4MB photo straight
  off a phone lands in the database at about 1.2MB. `next/image` then resizes
  and re-formats again on delivery.

  Vercel refuses any request **or response** over 4.5MB, so anything over 4MB
  is shrunk in the browser before it is sent (`lib/cms/shrink-image.ts`), to
  the same 2560px. `serverActions.bodySizeLimit` in `next.config.ts` is raised
  from Next's 1MB default to match. GIFs are never re-encoded (that would lose
  the animation), so they must already be under 4MB — and so must PDFs, which
  can't be shrunk in the browser. A PDF is checked to really be a PDF, and is
  served under its own file name.

  Deleting a file from the library also takes it out of every gallery; a cover
  photo or PDF that is deleted simply disappears from its article.

  The cache-busting checksum sits in the URL path rather than a query string so
  that `images.localPatterns` in `next.config.ts` can pin `search: ""`, which
  stops anyone flooding the image optimizer's cache with invented query
  strings.
- **Sessions** — server-side rows in the `sessions` table; the cookie carries
  only a signed session id, so revoking access takes effect on the next request.
  Passwords are hashed with bcrypt (12 rounds). `proxy.ts` (Next 16's renamed
  middleware) does a cheap signature check before pages render; the admin layout
  and every server action do the authoritative database check.

### Useful commands

| Command | Does |
|---|---|
| `npm run db:up` / `db:down` | Start / stop the Docker database |
| `npm run db:migrate` | Apply any migrations this database hasn't had (also runs on every build) |
| `npm run db:generate` | Write a new migration from changes to `db/schema.ts` — then make it re-runnable by hand, as `0002` is |
| `npm run db:push` | Apply `db/schema.ts` directly, for throwaway local databases |
| `npm run db:studio` | Browse the data in Drizzle Studio |
| `npm run db:seed` | Load the site's content (safe to re-run; skips non-empty tables) |
| `npm run cms:user -- --email=… --password=… --role=admin` | Create an account or reset a password from the terminal |
