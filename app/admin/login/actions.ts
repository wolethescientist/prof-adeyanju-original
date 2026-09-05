"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export type LoginState = { error?: string };

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").max(320),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

/** Only allow redirects back into our own admin area. */
function safeNext(next: string | undefined) {
  if (!next || !next.startsWith("/admin") || next.startsWith("//")) return "/admin";
  return next;
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  /* Always run a comparison, even when the account does not exist, so the
     response time does not reveal which emails are registered. */
  const hash =
    user?.passwordHash ??
    "$2b$12$0000000000000000000000000000000000000000000000000000";
  const ok = await verifyPassword(password, hash);

  if (!user || !ok || !user.isActive) {
    return { error: "That email and password do not match an active account." };
  }

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  await createSession(user.id);

  redirect(safeNext(parsed.data.next));
}
