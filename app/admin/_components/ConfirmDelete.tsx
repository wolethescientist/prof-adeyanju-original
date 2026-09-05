"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Two-step delete.
 *
 * An inline confirmation rather than window.confirm: it keeps the warning in
 * the page where it can name what is about to be removed, and it never blocks
 * the tab. The action is called inside a transition so the button can show
 * progress and cannot be double-submitted.
 */
export default function ConfirmDelete({
  action,
  what,
  compact = false,
}: {
  action: () => Promise<void>;
  what: string;
  compact?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size={compact ? "icon-sm" : "sm"}
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${what}`}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 />
        {!compact && "Delete"}
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground">
        Delete {what}?
      </span>
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(async () => { await action(); })}
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </span>
  );
}
