import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import type { ContentType } from "./registry";

/* After the registry has resolved the slug, rows are addressed through the
   columns every content table shares. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

export type EntryRow = Record<string, unknown> & {
  id: string;
  position: number;
  published: boolean;
};

/** All rows in a section, published or not, in the order the team set. */
export async function listEntries(type: ContentType): Promise<EntryRow[]> {
  const table = type.table as AnyTable;
  const rows = await db.select().from(table).orderBy(asc(table.position));
  return rows as EntryRow[];
}

/** A single row, or undefined when the id does not exist. */
export async function getEntry(
  type: ContentType,
  id: string
): Promise<EntryRow | undefined> {
  const table = type.table as AnyTable;
  const rows = (await db
    .select()
    .from(table)
    .where(eq(table.id, id))
    .limit(1)) as EntryRow[];
  return rows[0];
}

/** How many rows a section holds — used for the dashboard counts. */
export async function countEntries(type: ContentType) {
  const rows = await listEntries(type);
  return {
    total: rows.length,
    published: rows.filter((row) => row.published).length,
  };
}
