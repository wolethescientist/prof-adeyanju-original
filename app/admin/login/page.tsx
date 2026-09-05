import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — Site manager",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="min-h-screen grid place-items-center px-6 py-16 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="font-heading text-lg font-bold">
            I.A. Adeyanju<span className="text-primary">.</span>
          </p>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Site manager</h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Sign in to update the website.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Need an account? Ask a site administrator to create one for you.
        </p>
      </div>
    </div>
  );
}
