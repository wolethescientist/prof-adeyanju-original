import type { Metadata } from "next";
import Sidebar from "../_components/Sidebar";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Site manager",
  robots: { index: false, follow: false },
};

/**
 * The authenticated shell.
 *
 * proxy.ts already bounced anyone without a validly-signed cookie, but that
 * check cannot reach the database. This is the authoritative one: it confirms
 * the session row still exists and the account is still active.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="md:flex min-h-screen bg-background">
      <Sidebar user={user} />
      <div className="grow min-w-0">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
