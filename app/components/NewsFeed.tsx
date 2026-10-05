"use client";

import { useState } from "react";
import type { NewsCard as News } from "@/app/lib/news";
import type { NewsCategory } from "@/db/schema";
import { NEWS_CATEGORY_INFO, NEWS_CATEGORY_ORDER } from "@/lib/cms/news";
import { cn } from "@/lib/utils";
import { NewsCard } from "./cards";

type Filter = "all" | NewsCategory;

/**
 * Every news item as a card, newest first. Filter buttons narrow the feed to
 * one kind of update — shown only for the kinds that have something in them,
 * and only once there is more than one kind, so a visitor is never offered a
 * filter that leads to nothing.
 */
export default function NewsFeed({ items }: { items: News[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const kinds = NEWS_CATEGORY_ORDER.filter((kind) => items.some((item) => item.category === kind));
  const shown = filter === "all" ? items : items.filter((item) => item.category === filter);

  const options: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: items.length },
    ...kinds.map((kind) => ({
      value: kind,
      label: NEWS_CATEGORY_INFO[kind].filter,
      count: items.filter((item) => item.category === kind).length,
    })),
  ];

  return (
    <div>
      {kinds.length > 1 && (
        <div role="group" aria-label="Show" className="mb-8 flex flex-wrap gap-2">
          {options.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:border-primary/40"
                )}
              >
                {option.label}
                <span className={cn("text-xs tabular-nums", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <li key={item.id}>
            <NewsCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
