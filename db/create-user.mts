/**
 * Creates or updates a CMS account from the command line.
 *
 * Useful for the very first administrator, or to reset a password when nobody
 * can get in. Day to day, accounts are managed inside the CMS at /admin/team.
 *
 *   npm run cms:user -- --email=media@example.com --name="Media Team" \
 *     --password='a-strong-password-1' --role=admin
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });
config({ path: ".env" });

const { db, pool } = await import("./index");
const { users } = await import("./schema");
const { hashPassword, passwordProblem } = await import("../lib/auth/password");

function arg(name: string) {
  const match = process.argv.find((value) => value.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : undefined;
}

async function main() {
  const email = arg("email")?.toLowerCase().trim();
  const password = arg("password");
  const name = arg("name") ?? "Site Administrator";
  const role = (arg("role") ?? "admin") as "admin" | "editor";

  if (!email || !password) {
    throw new Error(
      "Usage: npm run cms:user -- --email=you@example.com --name='Your Name' " +
        "--password='secret123456' --role=admin|editor"
    );
  }
  if (role !== "admin" && role !== "editor") {
    throw new Error("--role must be either admin or editor.");
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);

  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, name, role, isActive: true, updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    console.log(`Updated ${email} (${role}) and reset the password.`);
  } else {
    await db.insert(users).values({ email, name, role, passwordHash });
    console.log(`Created ${email} (${role}).`);
  }
}

await main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
