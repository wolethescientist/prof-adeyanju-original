"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDelete from "./ConfirmDelete";

/**
 * Per-row controls in a section list: reorder, show/hide, edit, delete.
 *
 * These call their server action directly inside a transition rather than
 * wrapping each icon in its own <form>. A row carries four separate actions,
 * and nesting four forms per row proved unreliable to dispatch; calling the
 * action gives one predictable path and a pending state we can disable the
 * whole group with.
 */
export default function RowActions({
  editHref,
  published,
  isFirst,
  isLast,
  what,
  fixed = false,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDelete,
}: {
  editHref: string;
  published: boolean;
  isFirst: boolean;
  isLast: boolean;
  what: string;
  /** Fixed sections can only be edited — never added to, reordered or removed. */
  fixed?: boolean;
  onMoveUp: () => Promise<void>;
  onMoveDown: () => Promise<void>;
  onToggle: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => () => {
    startTransition(async () => {
      await action();
    });
  };

  const editButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      nativeButton={false}
      aria-label={`Edit ${what}`}
      className="text-muted-foreground"
      render={<Link href={editHref} />}
    >
      <Pencil />
    </Button>
  );

  if (fixed) {
    return <div className="flex items-center gap-1 shrink-0">{editButton}</div>;
  }

  return (
    <div
      className="flex items-center gap-1 shrink-0"
      data-pending={pending ? "" : undefined}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isFirst || pending}
        onClick={run(onMoveUp)}
        aria-label={`Move ${what} up`}
        className="text-muted-foreground"
      >
        <ChevronUp />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isLast || pending}
        onClick={run(onMoveDown)}
        aria-label={`Move ${what} down`}
        className="text-muted-foreground"
      >
        <ChevronDown />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={pending}
        onClick={run(onToggle)}
        aria-label={published ? `Hide ${what}` : `Show ${what}`}
        title={published ? "Visible on the site" : "Hidden from the site"}
        className={published ? "text-primary" : "text-muted-foreground"}
      >
        {published ? <Eye /> : <EyeOff />}
      </Button>

      {editButton}

      <ConfirmDelete action={onDelete} what={what} compact />
    </div>
  );
}
