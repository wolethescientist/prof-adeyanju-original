import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, unsealSessionId } from "@/lib/auth/cookie";

/**
 * Next.js 16 renamed Middleware to Proxy; this is that file.
 *
 * It only does the cheap, optimistic check the docs recommend — is there a
 * validly-signed session cookie? — and bounces anonymous visitors to the login
 * screen before a page renders. The authoritative check (does the session row
 * still exist, is the account still active) happens in the admin layout, which
 * runs in the Node runtime where the database is reachable.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionId = await unsealSessionId(token);

  /* Already signed in and heading for the login page — send them onward. */
  if (pathname === "/admin/login" && sessionId) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/admin/login") return NextResponse.next();

  if (!sessionId) {
    const login = new URL("/admin/login", request.url);
    /* Remember where they were going so login can return them there. */
    if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  /* Everything under /admin except Next's own asset routes. */
  matcher: ["/admin/:path*"],
};
