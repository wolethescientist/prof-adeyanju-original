"use client";

import ErrorScreen from "@/app/components/ErrorScreen";

/** Fallback for anything under /admin that sits outside the dashboard layout. */
export default function AdminError({
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
      title="Something went wrong"
      description="This page could not be loaded. Try again, or head back to the sign-in screen."
      action={{ href: "/admin/login", label: "Go to sign in" }}
    />
  );
}
