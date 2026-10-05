import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-background">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink p-12 text-white">
        <Image
          src="/images/adeyanju-portrait.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-[50%_20%] opacity-20"
        />
        <p className="relative text-2xl font-semibold tracking-tight">I.A. Adeyanju</p>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">The site manager</h1>
          <p className="mt-4 text-white/80 leading-relaxed">
            Post awards, invitations, lectures and press coverage, with photos, the full
            story and a PDF. They go live on the website as soon as you save.
          </p>
        </div>
      </div>

      <div className="grid place-items-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xl font-semibold tracking-tight lg:hidden">I.A. Adeyanju</p>
            <h2 className="mt-6 lg:mt-0 text-3xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the email and password for your site manager account.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <LoginForm next={next} />
          </div>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Need an account? Ask a site administrator to add you under Team.
          </p>
        </div>
      </div>
    </div>
  );
}
