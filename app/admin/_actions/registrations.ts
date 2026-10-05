"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { eventRegistrations } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

/** Removes a registration (a typo, a test, spam). */
export async function deleteRegistration(id: string) {
  await requireUser();
  await db.delete(eventRegistrations).where(eq(eventRegistrations.id, id));
  revalidatePath("/admin/registrations");
}
