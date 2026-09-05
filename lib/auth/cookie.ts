import { SignJWT, jwtVerify } from "jose";

/**
 * The session cookie carries nothing but a signed session id. All the real
 * state (who it belongs to, when it expires, whether it was revoked) lives in
 * the `sessions` table, so a stolen or stale cookie is worthless once the row
 * is gone.
 *
 * Signing/verifying is kept in this file — with no database import — because
 * proxy.ts runs on the edge runtime and can do the signature check there,
 * while the full lookup happens in the Node runtime.
 */
export const SESSION_COOKIE = "adeyanju_cms_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set to a random string of at least 32 characters. " +
        "Generate one with: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(value);
}

export async function sealSessionId(sessionId: string) {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret());
}

/** Returns the session id, or null when the token is missing/expired/forged. */
export async function unsealSessionId(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const sid = payload.sid;
    return typeof sid === "string" ? sid : null;
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    /* Lax still sends the cookie on top-level navigation to /admin, but keeps
       it off cross-site POSTs. */
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
