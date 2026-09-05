import "server-only";

import { and, eq, gt, lt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  cookieOptions,
  sealSessionId,
  unsealSessionId,
} from "./cookie";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
};

/** Issues a fresh session row and sets the signed cookie. */
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 500) ?? null;

  const [row] = await db
    .insert(sessions)
    .values({ userId, expiresAt, userAgent })
    .returning({ id: sessions.id });

  const token = await sealSessionId(row.id);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions());

  /* Opportunistic cleanup so expired rows do not accumulate; cheap enough to
     ride along with a login, which is rare. */
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

/**
 * Resolves the signed-in user, or null.
 *
 * Wrapped in React's `cache` so the layout, the page and any server action in
 * the same request share one database round-trip.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sessionId = await unsealSessionId(token);
  if (!sessionId) return null;

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);

  /* A deactivated account keeps its rows but loses access immediately. */
  if (!row || !row.isActive) return null;

  return { id: row.id, email: row.email, name: row.name, role: row.role };
});

/** For pages and actions that must not run for anonymous visitors. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** For the few actions only an admin may perform (managing team members). */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("This action requires an administrator account.");
  }
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const sessionId = await unsealSessionId(store.get(SESSION_COOKIE)?.value);
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  store.delete(SESSION_COOKIE);
}
