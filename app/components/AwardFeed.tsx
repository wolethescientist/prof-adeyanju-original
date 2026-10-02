"use client";

import { useState } from "react";
import type { AwardCard as Award } from "@/app/lib/articles";
import type { AwardRecipient } from "@/db/schema";
import { cn } from "@/lib/utils";
import { AwardCard } from "./cards";
import { RECIPIENT_NAME } from "./Seal";

type Filter = "all" | AwardRecipient;

/**
 * Every award as a card, newest first, the first one featured. Filter buttons
 * split them by who received them — shown only once both kinds exist, so a
 * visitor is never offered a filter that leads to nothing.
 */
export default function AwardFeed({ awards }: { awards: Award[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: awards.length,
    personal: awards.filter((award) => award.recipient === "personal").length,
    gbb: awards.filter((award) => award.recipient === "gbb").length,
  };
  const showFilters = counts.personal > 0 && counts.gbb > 0;
  const shown = filter === "all" ? awards : awards.filter((award) => award.recipient === filter);

  const options: { value: Filter; label: string }[] = [
    { value: "all", label: "All awards" },
    { value: "personal", label: `To ${RECIPIENT_NAME.personal}` },
    { value: "gbb", label: `To ${RECIPIENT_NAME.gbb}` },
  ];

  return (
    <div>
      {showFilters && (
        <div
          role="group"
          aria-label="Show awards given to"
          className="mb-10 inline-flex flex-wrap gap-1 rounded-2xl border bg-card p-1 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:rounded-full"
        >
          {options.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 cursor-pointer",
                  active
                    ? "bg-ink text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "font-mono text-[0.7rem] tabular-nums",
                    active ? "text-[#f3dc9b]" : "text-muted-foreground/70"
                  )}
                >
                  {counts[option.value]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((award, i) => (
          <li
            key={award.id}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
              i === 0 && "sm:col-span-2 lg:col-span-3"
            )}
            style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          >
            <AwardCard award={award} featured={i === 0} />
          </li>
        ))}
      </ul>
    </div>
  );
}
