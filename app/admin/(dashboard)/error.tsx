"use client";

import ErrorScreen from "@/app/components/ErrorScreen";

/** Covers the admin pages. The sidebar layout sits above this, so it survives. */
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <ErrorScreen
      error={error}
      retry={unstable_retry}
      title="That didn’t work"
      description="Something went wrong loading this screen. Your content is safe — nothing was changed. Try again, and if it keeps happening send the reference below to your developer."
      action={{ href: "/admin", label: "Back to dashboard" }}
    />
  );
}
