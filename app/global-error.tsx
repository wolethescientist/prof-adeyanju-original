"use client";

import { useEffect } from "react";
import { Public_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

/**
 * Last line of defence: this catches failures in the root layout itself, which
 * the per-segment error boundaries sit inside and therefore cannot handle.
 *
 * It replaces the whole document when active, so it has to bring its own
 * <html> and <body> — and its own fonts and styles with them. Metadata exports
 * are not allowed in a client component, hence the plain <title>.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={`h-full antialiased ${publicSans.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-full">
        <title>Something went wrong</title>
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
            The site hit an unexpected problem and could not finish loading.
            Please try again in a moment.
          </p>

          <button
            onClick={() => unstable_retry()}
            className="mt-8 h-11 cursor-pointer rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>

          {error.digest && (
            <p className="mt-8 text-xs text-muted-foreground">
              Reference{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">
                {error.digest}
              </code>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
