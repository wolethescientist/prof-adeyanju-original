"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

/** Copies the page's address, for sharing an article. */
export default function CopyLink() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* Clipboard access can be refused; the address bar still works. */
        }
      }}
      className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      {copied ? (
        <Check className="size-4 text-primary" aria-hidden="true" />
      ) : (
        <Link2 className="size-4" aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}
