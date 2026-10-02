import { requireUser } from "@/lib/auth/session";
import PasswordForm from "@/app/admin/_components/PasswordForm";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h1 className="font-heading text-4xl font-medium tracking-tight">Your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Signed in as {user.name} ({user.email}).
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Change your password
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}
