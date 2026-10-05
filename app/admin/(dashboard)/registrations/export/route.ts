import { desc } from "drizzle-orm";
import { db } from "@/db";
import { eventRegistrations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { registrationsCsv } from "@/lib/registrations-csv";

/** Downloads every registration as a CSV. Signed-in team members only. */
export async function GET() {
  if (!(await getCurrentUser())) {
    return new Response("Sign in to download registrations.", { status: 401 });
  }

  const rows = await db
    .select()
    .from(eventRegistrations)
    .orderBy(desc(eventRegistrations.createdAt));

  const day = new Date().toISOString().slice(0, 10);
  return new Response(registrationsCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${day}.csv"`,
      /* Personal details: never cached by the browser or a proxy. */
      "Cache-Control": "private, no-store",
    },
  });
}
