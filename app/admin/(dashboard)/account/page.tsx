import { requireUser } from "@/lib/auth/session";
import PasswordForm from "@/app/admin/_components/PasswordForm";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground font-medium">
          Signed in as {user.name} ({user.email}).
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Change your password
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}
