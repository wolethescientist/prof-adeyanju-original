import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">404</p>
      <h1 className="mt-4 font-heading text-4xl font-medium tracking-tight">
        We can&apos;t find that page
      </h1>
      <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
        The link may be out of date, or the page may have moved.
      </p>
      <Button
        size="lg"
        className="mt-8 h-11 px-6 font-bold"
        nativeButton={false}
        render={<Link href="/" />}
      >
        Return home
      </Button>
    </main>
  );
}
