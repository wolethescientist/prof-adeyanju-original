"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

/** A single server action behind a button, with a pending state. */
export default function ActionButton({
  action,
  label,
  pendingLabel,
}: {
  action: () => Promise<void>;
  label: string;
  pendingLabel?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(async () => { await action(); })}
    >
      {pending ? (pendingLabel ?? `${label}…`) : label}
    </Button>
  );
}
