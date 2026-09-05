import bcrypt from "bcryptjs";

/* 12 rounds: comfortably above the 2026 baseline, still fast enough that a
   login on a cold serverless function does not feel sluggish. */
const ROUNDS = 12;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/** Mirrors the rule enforced in the UI, kept here so the server is the source of truth. */
export const PASSWORD_MIN_LENGTH = 10;

export function passwordProblem(plain: string): string | null {
  if (plain.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-zA-Z]/.test(plain) || !/[0-9]/.test(plain)) {
    return "Password must contain both letters and numbers.";
  }
  return null;
}
