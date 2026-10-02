import type { Metadata } from "next";
import Image from "next/image";
import Laurel from "@/app/components/Laurel";
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
          className="object-cover object-[50%_20%] opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" aria-hidden="true" />
        <div className="foil absolute inset-x-0 top-0 h-[3px]" aria-hidden="true" />

        <p className="relative font-heading text-2xl font-semibold tracking-tight">
          I.A. Adeyanju<span className="text-gold">.</span>
        </p>

        <div className="relative max-w-md">
          <Laurel className="size-16 text-gold/80" />
          <h1 className="mt-6 font-heading text-5xl font-medium leading-[1.05] tracking-tight">
            The site manager
          </h1>
          <p className="mt-4 text-white/70 leading-relaxed">
            Post awards, press coverage and initiatives — with photos, the full
            story and a PDF — and they go live on the website as soon as you save.
          </p>
        </div>
      </div>

      <div className="grid place-items-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="font-heading text-xl font-semibold tracking-tight lg:hidden">
              I.A. Adeyanju<span className="text-gold">.</span>
            </p>
            <h2 className="mt-6 lg:mt-0 font-heading text-4xl font-medium tracking-tight">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the email and password for your site manager account.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
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
