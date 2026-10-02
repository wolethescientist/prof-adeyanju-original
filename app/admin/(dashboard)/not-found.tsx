import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Shown for an unknown section, or when an editor opens a screen reserved for
 * administrators — the Team page calls notFound() rather than revealing that
 * it exists.
 */
export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-3xl font-medium tracking-tight">
        That screen isn&apos;t available
      </h1>
      <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
        It may have moved, or your account may not have access to it. If you
        think you should, ask a site administrator.
      </p>
      <Button
        size="lg"
        className="mt-8 h-11 px-6 font-bold"
        nativeButton={false}
        render={<Link href="/admin" />}
      >
        Back to dashboard
      </Button>
    </div>
  );
}
