import { Download, Users } from "lucide-react";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { eventRegistrations } from "@/db/schema";
import { Button } from "@/components/ui/button";
import ConfirmDelete from "@/app/admin/_components/ConfirmDelete";
import { deleteRegistration } from "@/app/admin/_actions/registrations";
import { requireUser } from "@/lib/auth/session";
import { EVENT } from "@/lib/event";

export const dynamic = "force-dynamic";

const when = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function RegistrationsPage() {
  await requireUser();

  const rows = await db
    .select()
    .from(eventRegistrations)
    .orderBy(desc(eventRegistrations.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="size-4" aria-hidden="true" />
            {EVENT.name} · {EVENT.dateLabel}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-medium tracking-tight">Registrations</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Everyone who registered to attend, newest first. Download the list as a CSV to open in
            Excel or Google Sheets.
          </p>
        </div>
        {rows.length > 0 && (
          <Button
            size="lg"
            className="h-11 shrink-0 px-5 font-bold"
            nativeButton={false}
            render={<a href="/admin/registrations/export" download />}
          >
            <Download data-icon="inline-start" />
            Download CSV
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-card px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-heading text-xl font-medium">No registrations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            They appear here as soon as someone registers on{" "}
            <span className="font-medium">{EVENT.path}</span>.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            {rows.length} {rows.length === 1 ? "person" : "people"} registered
          </p>
          <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
            {rows.map((row, index) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3.5 hover:bg-accent/40 transition-colors"
              >
                <span className="w-8 shrink-0 text-sm tabular-nums text-muted-foreground/70">
                  {rows.length - index}
                </span>
                <div className="min-w-0 grow basis-56">
                  <p className="truncate font-semibold">{row.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{row.email}</p>
                </div>
                <p className="shrink-0 text-sm tabular-nums">{row.phone}</p>
                <p className="shrink-0 text-sm text-muted-foreground">{when.format(row.createdAt)}</p>
                <ConfirmDelete
                  action={deleteRegistration.bind(null, row.id)}
                  what={`the registration of ${row.name}`}
                  compact
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
