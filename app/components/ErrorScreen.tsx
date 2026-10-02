"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared fallback for the error boundaries.
 *
 * The point is that a failure never shows a blank page. It says what happened
 * in plain language, offers a way back, and surfaces the digest — that short
 * code is what makes the real error findable in the deployment logs, and
 * without it a report is just "the site broke".
 */
export default function ErrorScreen({
  error,
  retry,
  title,
  description,
  action,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <span
        className="mb-6 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive"
        aria-hidden="true"
      >
        <AlertTriangle className="size-6" />
      </span>

      <h1 className="font-heading text-3xl font-medium tracking-tight">{title}</h1>
      <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {retry && (
          <Button size="lg" className="h-11 px-6 font-bold" onClick={retry}>
            <RotateCw data-icon="inline-start" />
            Try again
          </Button>
        )}
        {action && (
          <Button
            size="lg"
            variant="outline"
            className="h-11 bg-card px-6 font-semibold"
            nativeButton={false}
            render={<a href={action.href} />}
          >
            {action.label}
          </Button>
        )}
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-muted-foreground">
          If you need to report this, quote reference{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">
            {error.digest}
          </code>
        </p>
      )}
    </div>
  );
}
