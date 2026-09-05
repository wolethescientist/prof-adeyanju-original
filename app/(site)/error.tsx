"use client";

import ErrorScreen from "@/app/components/ErrorScreen";

/** Covers the public pages. Nav and footer stay in place above this. */
export default function SiteError({
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
      title="This page isn’t available right now"
      description="Something went wrong at our end. Please try again in a moment."
      action={{ href: "/", label: "Return home" }}
    />
  );
}
