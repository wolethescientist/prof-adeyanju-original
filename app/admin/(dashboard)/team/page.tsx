import { asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import ActionButton from "@/app/admin/_components/ActionButton";
import AddUserForm from "@/app/admin/_components/AddUserForm";
import ConfirmDelete from "@/app/admin/_components/ConfirmDelete";
import { deleteUser, setUserActive } from "@/app/admin/_actions/team";

export default async function TeamPage() {
  const current = await getCurrentUser();
  /* The sidebar hides this link for editors; this stops them reaching it by
     typing the URL. */
  if (current?.role !== "admin") notFound();

  const team = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-xl">
        <h1 className="font-heading text-4xl font-medium tracking-tight">Team</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Everyone who can sign in and update the website.
        </p>
      </div>

      <ul className="rounded-xl border bg-card divide-y overflow-hidden">
        {team.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
            <div className="grow min-w-0">
              <p className="text-sm font-semibold truncate">
                {member.name}
                {member.id === current.id && (
                  <span className="ml-2 text-xs font-medium text-muted-foreground">
                    you
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {member.email}
                {member.lastLoginAt
                  ? ` · last signed in ${member.lastLoginAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                  : " · never signed in"}
              </p>
            </div>

            <Badge variant="secondary" className="shrink-0 font-bold capitalize">
              {member.role}
            </Badge>

            {!member.isActive && (
              <Badge variant="outline" className="shrink-0 font-bold">
                Suspended
              </Badge>
            )}

            {member.id !== current.id && (
              <div className="flex items-center gap-2 shrink-0">
                <ActionButton
                  action={setUserActive.bind(null, member.id, !member.isActive)}
                  label={member.isActive ? "Suspend" : "Restore"}
                />
                <ConfirmDelete
                  action={deleteUser.bind(null, member.id)}
                  what={member.name}
                  compact
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-3 max-w-lg">
        <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Add someone
        </h2>
        <AddUserForm />
      </section>
    </div>
  );
}
