"use server";

import { eq, ne, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import {
  hashPassword,
  passwordProblem,
  verifyPassword,
} from "@/lib/auth/password";

export type TeamState = { error?: string; success?: string };

const newUserSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(200),
  email: z.email("Enter a valid email address.").max(320),
  role: z.enum(["admin", "editor"]),
  password: z.string(),
});

/** Adds a member of the media team. Administrators only. */
export async function createUser(
  _prev: TeamState,
  formData: FormData
): Promise<TeamState> {
  await requireAdmin();

  const parsed = newUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const problem = passwordProblem(parsed.data.password);
  if (problem) return { error: problem };

  const email = parsed.data.email.toLowerCase().trim();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) return { error: "Someone already uses that email address." };

  await db.insert(users).values({
    name: parsed.data.name,
    email,
    role: parsed.data.role,
    passwordHash: await hashPassword(parsed.data.password),
  });

  revalidatePath("/admin/team");
  return {
    success: `${parsed.data.name} can now sign in. Share the password with them privately, and ask them to change it.`,
  };
}

/**
 * Suspends or restores an account. Suspending also drops that person's live
 * sessions, so they lose access straight away rather than at token expiry.
 */
export async function setUserActive(id: string, active: boolean) {
  const admin = await requireAdmin();
  if (id === admin.id) return;

  await db
    .update(users)
    .set({ isActive: active, updatedAt: new Date() })
    .where(eq(users.id, id));

  if (!active) await db.delete(sessions).where(eq(sessions.userId, id));

  revalidatePath("/admin/team");
}

export async function deleteUser(id: string) {
  const admin = await requireAdmin();
  if (id === admin.id) return;

  /* Never remove the last administrator — that would lock everyone out of
     team management for good. */
  const [{ admins }] = await db
    .select({ admins: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), ne(users.id, id)));
  if (admins === 0) return;

  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/team");
}

/** Changes the signed-in user's own password. */
export async function changePassword(
  _prev: TeamState,
  formData: FormData
): Promise<TeamState> {
  const user = await requireUser();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next !== confirm) return { error: "The new passwords do not match." };

  const problem = passwordProblem(next);
  if (problem) return { error: problem };

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    return { error: "Your current password is not correct." };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(next), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { success: "Password changed." };
}
