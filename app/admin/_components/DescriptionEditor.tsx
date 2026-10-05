"use client";

import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { updateMediaAlt } from "../_actions/media";

/**
 * A photo's description, editable where it is shown. It is what screen
 * readers say and what appears under the photo in the viewer.
 */
export default function DescriptionEditor({ id, alt }: { id: string; alt: string }) {
  const [value, setValue] = useState(alt);
  const [saved, setSaved] = useState(alt);
  const [pending, startTransition] = useTransition();
  const changed = value.trim() !== saved && value.trim() !== "";

  return (
    <form
      className="flex flex-col gap-1.5"
      action={(formData) =>
        startTransition(async () => {
          await updateMediaAlt(id, formData);
          setSaved(value.trim());
        })
      }
    >
      <label htmlFor={`alt-${id}`} className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground">
        Description
      </label>
      <div className="flex gap-1.5">
        <input
          id={`alt-${id}`}
          name="alt"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={500}
          className="h-8 min-w-0 grow rounded-md border bg-background px-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {changed ? (
          <button
            type="submit"
            disabled={pending}
            className="h-8 shrink-0 rounded-md bg-primary px-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-60"
          >
            {pending ? "Saving" : "Save"}
          </button>
        ) : (
          saved !== alt && (
            <span className="grid size-8 shrink-0 place-items-center text-primary" aria-label="Saved">
              <Check className="size-4" />
            </span>
          )
        )}
      </div>
    </form>
  );
}
