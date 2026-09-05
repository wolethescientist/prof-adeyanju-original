"use server";

import { asc, desc, eq, gt, lt, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { getContentType, schemaFor, type ContentType } from "@/lib/cms/registry";

/**
 * One set of actions for all ten content sections.
 *
 * The registry says which table a slug maps to and how its fields validate, so
 * these functions stay generic. Everything is re-validated here rather than
 * trusted from the form — a server action is a public HTTP endpoint.
 */

export type FormState = { error?: string; fieldErrors?: Record<string, string> };

/* The registry's table union is heterogeneous; after `schemaFor` has validated
   the payload we address the shared columns (id, position, published) through
   this narrow view rather than fighting the union in every call. */
type GenericTable = {
  id: unknown;
  position: unknown;
  published: unknown;
  updatedAt: unknown;
};
function cols(type: ContentType) {
  return type.table as unknown as GenericTable;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

function resolve(slug: string) {
  const type = getContentType(slug);
  if (!type) throw new Error(`Unknown section: ${slug}`);
  return type;
}

/**
 * Sections whose rows are dictated by the page designs accept edits only.
 * The screens already hide these controls; this is the check that matters,
 * since a server action is a public endpoint.
 */
function refuseIfFixed(type: ContentType) {
  if (type.fixed) {
    throw new Error(`“${type.label}” has a fixed set of entries that cannot be added to or removed.`);
  }
}

/** Refresh the public pages this section feeds, plus the admin list itself. */
function refresh(type: ContentType) {
  for (const path of type.revalidates) revalidatePath(path);
  revalidatePath(`/admin/content/${type.slug}`);
}

/** Turns the posted form into the shape the table expects. */
function readForm(type: ContentType, formData: FormData) {
  const raw: Record<string, unknown> = {};

  for (const field of type.fields) {
    const value = formData.get(field.name);
    raw[field.name] = typeof value === "string" ? value.trim() : "";
  }
  raw.published = formData.get("published") === "on";

  const parsed = schemaFor(type).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false as const, fieldErrors };
  }

  /* An empty optional field arrives as "". Most columns are nullable, and NULL
     is the tidier thing to store — the public pages can then rely on a plain
     falsy check. But some optional fields map to NOT NULL columns that default
     to an empty string (a counter's suffix, for instance), and writing NULL to
     one of those fails the constraint. Ask the column which it is rather than
     maintaining a list by hand, so a future field cannot reintroduce this. */
  const columns = type.table as unknown as Record<
    string,
    { notNull?: boolean } | undefined
  >;
  const values: Record<string, unknown> = { ...parsed.data };
  for (const field of type.fields) {
    if (values[field.name] === "" && !field.required) {
      values[field.name] = columns[field.name]?.notNull ? "" : null;
    }
  }

  return { ok: true as const, values };
}

export async function createEntry(
  slug: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();
  const type = resolve(slug);
  refuseIfFixed(type);

  const result = readForm(type, formData);
  if (!result.ok) return { fieldErrors: result.fieldErrors };

  /* New rows go to the bottom of the section. */
  const [{ highest }] = await db
    .select({ highest: max(cols(type).position as never) })
    .from(type.table as AnyTable);

  await db
    .insert(type.table as AnyTable)
    .values({ ...result.values, position: ((highest as number | null) ?? -1) + 1 });

  refresh(type);
  redirect(`/admin/content/${slug}?saved=1`);
}

export async function updateEntry(
  slug: string,
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();
  const type = resolve(slug);

  const result = readForm(type, formData);
  if (!result.ok) return { fieldErrors: result.fieldErrors };

  await db
    .update(type.table as AnyTable)
    .set({ ...result.values, updatedAt: new Date() })
    .where(eq(cols(type).id as never, id));

  refresh(type);
  redirect(`/admin/content/${slug}?saved=1`);
}

export async function deleteEntry(slug: string, id: string) {
  await requireUser();
  const type = resolve(slug);
  refuseIfFixed(type);

  await db.delete(type.table as AnyTable).where(eq(cols(type).id as never, id));

  refresh(type);
  redirect(`/admin/content/${slug}?deleted=1`);
}

/** Show or hide a row on the public site without deleting it. */
export async function togglePublished(slug: string, id: string) {
  await requireUser();
  const type = resolve(slug);

  await db
    .update(type.table as AnyTable)
    .set({
      published: sql`NOT ${cols(type).published}`,
      updatedAt: new Date(),
    })
    .where(eq(cols(type).id as never, id));

  refresh(type);
}

/**
 * Moves a row one place up or down by swapping positions with its neighbour,
 * which keeps ordering stable however many rows a section grows to.
 */
export async function moveEntry(slug: string, id: string, direction: "up" | "down") {
  await requireUser();
  const type = resolve(slug);
  refuseIfFixed(type);
  const table = type.table as AnyTable;
  const c = cols(type);

  const [current] = await db
    .select({ id: c.id as never, position: c.position as never })
    .from(table)
    .where(eq(c.id as never, id))
    .limit(1);
  if (!current) return;

  const [neighbour] = await db
    .select({ id: c.id as never, position: c.position as never })
    .from(table)
    .where(
      direction === "up"
        ? lt(c.position as never, current.position)
        : gt(c.position as never, current.position)
    )
    .orderBy(
      direction === "up" ? desc(c.position as never) : asc(c.position as never)
    )
    .limit(1);

  /* Already at the end of the list. */
  if (!neighbour) return;

  await db
    .update(table)
    .set({ position: neighbour.position })
    .where(eq(c.id as never, current.id));
  await db
    .update(table)
    .set({ position: current.position })
    .where(eq(c.id as never, neighbour.id));

  refresh(type);
}
