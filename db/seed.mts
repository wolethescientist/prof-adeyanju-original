/**
 * One-off migration of the site's existing content into the database, plus
 * creation of the first administrator account.
 *
 * Safe to re-run: each table is skipped if it already holds rows, so seeding a
 * database that the media team has already edited will not overwrite them.
 *
 *   npm run db:seed
 */
import { config } from "dotenv";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { count, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

config({ path: ".env.local" });
config({ path: ".env" });

const { db, pool } = await import("./index");
const schema = await import("./schema");
const { hashPassword, passwordProblem } = await import("../lib/auth/password");
const { imageSize } = await import("../lib/cms/image-size");
const { slugify } = await import("../lib/cms/slug");

/* ------------------------------------------------------------------ helpers */

/** Adds `position` to a list of rows so the seeded order matches the old site. */
function ordered<T extends object>(rows: T[]) {
  return rows.map((row, index) => ({ ...row, position: index }));
}

async function isEmpty(table: PgTable) {
  const [row] = await db.select({ n: count() }).from(table);
  return row.n === 0;
}

/** Inserts rows only into a table that is still empty. */
/** Gives article rows the page address the CMS would have made for them. */
function withSlugs<K extends string, R extends Record<K, string>>(key: K, rows: R[]) {
  return rows.map((row) => ({ ...row, slug: slugify(row[key]) }));
}

async function seedTable<T extends PgTable>(
  name: string,
  table: T,
  rows: Array<Omit<T["$inferInsert"], "position">>
) {
  if (!(await isEmpty(table))) {
    console.log(`  · ${name} already has rows — skipped`);
    return;
  }
  await db.insert(table).values(ordered(rows) as T["$inferInsert"][]);
  console.log(`  ✓ ${name}: ${rows.length} rows`);
}

/* -------------------------------------------------------------------- media */

const IMAGE_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Loads an image from public/images into the media library. */
async function seedImage(file: string, alt: string, uploadedById: string) {
  const existing = await db
    .select({ id: schema.media.id })
    .from(schema.media)
    .where(eq(schema.media.filename, file))
    .limit(1);
  if (existing.length > 0) return existing[0].id;

  const buf = await readFile(path.join(process.cwd(), "public", "images", file));
  const mimeType = IMAGE_MIME[path.extname(file).toLowerCase()] ?? "image/jpeg";
  const size = imageSize(buf, mimeType);

  const [row] = await db
    .insert(schema.media)
    .values({
      filename: file,
      mimeType,
      byteSize: buf.byteLength,
      width: size?.width ?? null,
      height: size?.height ?? null,
      alt,
      checksum: createHash("sha256").update(buf).digest("hex"),
      data: buf,
      uploadedById,
    })
    .returning({ id: schema.media.id });

  console.log(`  ✓ media: ${file}`);
  return row.id;
}

/* --------------------------------------------------------------------- main */

async function main() {
  console.log("\nSeeding the Prof. Adeyanju CMS\n");

  /* --- administrator ------------------------------------------------- */
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME ?? "Site Administrator";

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before seeding.\n" +
        "  ADMIN_EMAIL=media@example.com\n" +
        "  ADMIN_PASSWORD=<at least 10 characters, letters and numbers>"
    );
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(`ADMIN_PASSWORD rejected: ${problem}`);

  const existingUser = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  let adminId: string;
  if (existingUser.length > 0) {
    adminId = existingUser[0].id;
    console.log(`  · administrator ${email} already exists — skipped`);
  } else {
    const [row] = await db
      .insert(schema.users)
      .values({
        email,
        name,
        passwordHash: await hashPassword(password),
        role: "admin",
      })
      .returning({ id: schema.users.id });
    adminId = row.id;
    console.log(`  ✓ administrator created: ${email}`);
  }

  /* --- media --------------------------------------------------------- */
  const heroId = await seedImage(
    "adeyanju-portrait.jpg",
    "Official portrait of Prof. Ibrahim Adepoju Adeyanju",
    adminId
  );
  const teamId = await seedImage(
    "team-gbb.jpeg",
    "Prof. Ibrahim Adeyanju with Galaxy Backbone's executive management team",
    adminId
  );
  const mitId = await seedImage(
    "portrait-mit.png",
    "Prof. Ibrahim Adeyanju as an MIT Empowering the Teachers fellow",
    adminId
  );
  const phdId = await seedImage(
    "portrait-2.jpg",
    "Dr. Ibrahim Adeyanju at his PhD graduation, Robert Gordon University",
    adminId
  );
  await seedImage(
    "portrait-md.jpg",
    "Prof. Ibrahim Adeyanju, Managing Director of Galaxy Backbone",
    adminId
  );

  /* --- page image slots ----------------------------------------------- */
  /* One row per place the design has a photograph, pointing at the picture
     the site already shipped with. The team swaps these in the CMS. */
  await seedTable("page images", schema.siteImages, [
    {
      slot: "hero-portrait",
      label: "Home page — main portrait",
      imageId: heroId,
    },
    {
      slot: "profile-portrait",
      label: "Home page — profile photo",
      caption: "MIT Empowering the Teachers fellow — Cambridge, 2014",
      imageId: mitId,
    },
    {
      slot: "team-photo",
      label: "Team photograph",
      caption: "With Galaxy Backbone's executive management team, Abuja.",
      imageId: teamId,
    },
    {
      slot: "research-portrait",
      label: "Research page photo",
      caption: "PhD in Computing — Robert Gordon University, Aberdeen (2011)",
      imageId: phdId,
    },
  ]);

  /* --- content ------------------------------------------------------- */
  await seedTable("stats", schema.stats, [
    { value: 20, suffix: "+", label: "Industry awards under his leadership at GBB" },
    { value: 100, suffix: "K+", label: "Federal professionals on GovMail" },
    { value: 970, suffix: "+", label: "Scholarly citations" },
    { value: 30, suffix: "", label: "States reached by GBB fibre infrastructure" },
  ]);

  /* The Impact page carries its own counters, independent of the home page. */
  await seedTable("impact numbers", schema.impactStats, [
    { value: 100, suffix: "K+", label: "federal professionals on GovMail" },
    { value: 30, suffix: "", label: "states reached by fibre infrastructure" },
    { value: 9, suffix: "", label: "underserved LGAs connected so far" },
    { value: 20, suffix: "+", label: "industry awards in two years" },
  ]);

  await seedTable(
    "marquee",
    schema.marqueeItems,
    [
      "Galaxy Backbone",
      "1Government Cloud",
      "GovMail",
      "Project 774",
      "Artificial Intelligence",
      "MIT-ETT Fellow",
      "Intelligent Systems",
      "IDTS 2023–2028",
    ].map((text) => ({ text }))
  );

  await seedTable("timeline", schema.timelineEntries, [
    {
      period: "1999 — 2004",
      title: "B.Tech. Computer Engineering, First Class Honours",
      org: "Ladoke Akintola University of Technology (LAUTECH), Ogbomoso",
      detail:
        "Graduated top of his class, earning the Stephen Awokoya Scholarship for Science Education and a PTDF scholarship along the way.",
    },
    {
      period: "2006 — 2011",
      title: "M.Sc. Computing Information Engineering · Ph.D. Computing",
      org: "Robert Gordon University, Aberdeen, United Kingdom",
      detail:
        "Doctoral research in artificial intelligence, machine learning and natural language processing, backed by the UK ORSAS award. Followed by an EPSRC-sponsored postdoctoral fellowship in information retrieval.",
    },
    {
      period: "2014",
      title: "MIT Empowering the Teachers Fellow",
      org: "Massachusetts Institute of Technology, Cambridge, USA",
      detail:
        "Selected for the MIT-ETT fellowship, preparing African engineering faculty to build graduates with world-class problem-solving capabilities.",
    },
    {
      period: "2012 — 2023",
      title: "Professor of Computer Engineering (Intelligent Systems)",
      org: "Federal University Oye-Ekiti (FUOYE)",
      detail:
        "Rose to full Professor and served as FUOYE's pioneer Director of Quality Assurance, shaping the university's academic standards from the ground up.",
    },
    {
      period: "April 2023",
      title: "Executive Director, Digital Exploration & Technical Services",
      org: "Galaxy Backbone Limited, Abuja",
      detail:
        "Joined Nigeria's federal digital infrastructure company, leading technical services and digital exploration.",
    },
    {
      period: "February 2024 — present",
      title: "Managing Director / Chief Executive Officer",
      org: "Galaxy Backbone Limited",
      detail:
        "Appointed by His Excellency, President Bola Ahmed Tinubu, to lead Nigeria's digital backbone — the ICT and shared-services provider to the entire federal government.",
    },
  ]);

  await seedTable("initiatives", schema.initiatives, withSlugs("title", [
    {
      title: "1Government Cloud",
      detail:
        "Optimised and expanded Nigeria's sovereign government cloud, hosting critical systems for ministries, departments and agencies while advancing national data sovereignty.",
      icon: "Cloud",
    },
    {
      title: "GovMail",
      detail:
        "Launched a locally-developed secure email platform now serving over 100,000 federal government professionals.",
      icon: "Mail",
    },
    {
      title: "Project 774",
      detail:
        "Extending broadband connectivity to underserved Local Government Areas — nine LGAs connected and counting, on the road to all 774.",
      icon: "Signal",
    },
    {
      title: "Fibre-to-Hostel",
      detail:
        "Delivered campus connectivity projects at the University of Lagos, University of Abuja and University of Jos, bringing students onto the national backbone.",
      icon: "GraduationCap",
    },
    {
      title: "Cybersecurity & SOC",
      detail:
        "Strengthened national cyber resilience with 24/7 security monitoring, ISO recertification and an Integrated Management System.",
      icon: "ShieldCheck",
    },
    {
      title: "IDTS 2023 — 2028",
      detail:
        "Launched the Integrated Digital Transformation Strategy and a Government-as-a-Platform framework, with strategic partnerships including WIOCC to deepen the national fibre backbone.",
      icon: "Map",
    },
  ]));

  await seedTable("research areas", schema.researchAreas, [
    {
      area: "Artificial Intelligence & Machine Learning",
      detail:
        "Core research in intelligent systems, pattern recognition and applied machine learning classifiers.",
    },
    {
      area: "Natural Language Processing",
      detail:
        "Pioneering work on local language technology, including a database corpus for Yoruba handwriting and Yoruba character recognition.",
    },
    {
      area: "Information Retrieval",
      detail:
        "EPSRC-sponsored postdoctoral research at Robert Gordon University on textual case-based reasoning and retrieval systems.",
    },
    {
      area: "Embedded & Microprocessor Systems",
      detail:
        "Applied research in microprocessor control and embedded systems for real-world engineering problems.",
    },
  ]);

  await seedTable("education", schema.educationEntries, [
    {
      years: "1999 — 2004",
      degree: "B.Tech. Computer Engineering, First Class Honours",
      school: "LAUTECH, Ogbomoso, Nigeria",
      href: "https://www.lautech.edu.ng/",
    },
    {
      years: "2006 — 2007",
      degree: "M.Sc. Computing Information Engineering",
      school: "Robert Gordon University, Aberdeen, UK",
      href: "https://www.rgu.ac.uk/",
    },
    {
      years: "2007 — 2011",
      degree: "Ph.D. Computing — AI, Machine Learning & NLP",
      school: "Robert Gordon University, Aberdeen, UK",
      href: "https://www.rgu.ac.uk/",
    },
    {
      years: "2011 — 2012",
      degree: "EPSRC-sponsored Postdoctoral Research, Information Retrieval",
      school: "Robert Gordon University, Aberdeen, UK",
      href: "https://www.rgu.ac.uk/",
    },
    {
      years: "2014",
      degree: "Empowering the Teachers (ETT) Fellowship",
      school: "Massachusetts Institute of Technology, USA",
      href: "https://mitettfellows.org/fellow/prof-ibrahim-adeyanju/",
    },
    {
      years: "2012 — present",
      degree: "Professor of Computer Engineering (Intelligent Systems)",
      school: "Federal University Oye-Ekiti (FUOYE), Nigeria",
      href: "https://fuoye.edu.ng/members/ibrahim-adeyanju/",
    },
  ]);

  await seedTable(
    "honours",
    schema.honours,
    [
      "Appointed MD/CEO of Galaxy Backbone by President Bola Ahmed Tinubu (2024)",
      "Named among the Top 100 leading personalities in Nigeria's telecoms industry",
      "Blueprint Newspapers Enhanced Digital Infrastructure Award (2025)",
      "MIT Empowering the Teachers (MIT-ETT) Fellowship",
      "UK Overseas Research Students Award Scheme (ORSAS)",
      "Petroleum Technology Development Fund (PTDF) Scholarship",
      "Stephen Awokoya Scholarship for Science Education",
      "Fellow, Nigerian Young Academy (NYA)",
      "Registered Engineer, COREN",
    ].map((text) => ({ text }))
  );

  await seedTable("awards", schema.awards, withSlugs("award", [
    { award: "NET5.5G Pioneer Award", year: "2025" },
    { award: "Inaugural Artificial Intelligence Award", year: "2025" },
    {
      award:
        "Best IT Service Provider Company of the Year — International Standard Excellence Awards",
      year: "2025",
    },
    {
      award: "1st Overall, Federal Government Website Performance Scorecard",
      year: "2025",
    },
    { award: "BPSR Website Performance Award", year: "2025" },
    { award: "Nigeria @ 65 Independence Kitty — Overall Winner", year: "2025" },
  ]));

  await seedTable("press", schema.pressItems, withSlugs("title", [
    {
      outlet: "BusinessDay",
      title:
        "Galaxy Backbone at 20: The Quiet Architecture of Nigeria's Digital Future",
      href: "https://businessday.ng/top-stories/article/galaxy-backbone-at-20-the-quiet-architecture-of-nigerias-digital-future/",
    },
    {
      outlet: "TechEconomy",
      title:
        "Inside Galaxy Backbone: Two Years of Purposeful Leadership Under Ibrahim Adeyanju",
      href: "https://techeconomy.ng/two-years-of-purposeful-leadership-under-ibrahim-adeyanju/",
    },
    {
      outlet: "Vanguard",
      title:
        "Galaxy Backbone to unlock digital economy opportunities across Nigeria — Adeyanju",
      href: "https://www.vanguardngr.com/2026/06/galaxy-backbone-to-unlock-digital-economy-opportunities-across-nigeria-adeyanju/",
    },
    {
      outlet: "TechAfrica News",
      title:
        "Two-Year Review: Galaxy Backbone Advances Cloud, Cybersecurity and Public Sector Digital Services",
      href: "https://techafricanews.com/2026/02/25/two-year-review-galaxy-backbone-advances-cloud-cybersecurity-and-public-sector-digital-services/",
    },
  ]));

  await seedTable("at a glance", schema.glanceItems, [
    {
      label: "Current role",
      value: "MD/CEO, Galaxy Backbone Limited (since February 2024)",
    },
    { label: "Academic post", value: "Professor of Computer Engineering, FUOYE" },
    {
      label: "Doctorate",
      value: "PhD Computing, Robert Gordon University, Aberdeen",
    },
    {
      label: "Specialisation",
      value: "Artificial intelligence, machine learning and NLP",
    },
    { label: "Fellowship", value: "MIT Empowering the Teachers, Fall 2014" },
  ]);

  console.log("\nDone. Sign in at /admin/login\n");
}

await main()
  .catch((error) => {
    console.error("\nSeeding failed:\n", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
