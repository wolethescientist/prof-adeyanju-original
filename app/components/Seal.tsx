import type { AwardRecipient } from "@/db/schema";
import { cn } from "@/lib/utils";

export const RECIPIENT_NAME: Record<AwardRecipient, string> = {
  personal: "Prof. Adeyanju",
  gbb: "Galaxy Backbone",
};

/**
 * The round mark on every award that says who it was given to: IA for Prof.
 * Adeyanju himself, GBB for the company under his leadership.
 */
export default function Seal({
  recipient,
  className,
}: {
  recipient: AwardRecipient;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-grid size-11 shrink-0 place-items-center rounded-full border border-gold/80 bg-ink/80 text-[#f3dc9b] backdrop-blur-sm",
        className
      )}
      title={`Awarded to ${RECIPIENT_NAME[recipient]}`}
    >
      <span
        className="absolute inset-[3px] rounded-full border border-dashed border-gold/50"
        aria-hidden="true"
      />
      <span className="font-mono text-[0.6rem] font-semibold tracking-[0.08em]" aria-hidden="true">
        {recipient === "personal" ? "IA" : "GBB"}
      </span>
      <span className="sr-only">Awarded to {RECIPIENT_NAME[recipient]}</span>
    </span>
  );
}
