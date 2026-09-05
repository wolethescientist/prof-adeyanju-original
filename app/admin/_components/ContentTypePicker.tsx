"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { CONTENT_TYPES } from "@/lib/cms/registry";

/**
 * The section dropdown. Jumping straight to a section is the media team's most
 * common action, so it sits at the top of every content screen — including on
 * a phone, where the sidebar is hidden.
 */
export default function ContentTypePicker({ current }: { current?: string }) {
  const router = useRouter();

  const groups = [...new Set(CONTENT_TYPES.map((t) => t.group))];

  return (
    <Select
      aria-label="Choose a section to edit"
      value={current ?? ""}
      onChange={(event) => {
        const slug = event.target.value;
        if (slug) router.push(`/admin/content/${slug}`);
      }}
      className="max-w-xs font-medium"
    >
      <option value="" disabled>
        Choose a section…
      </option>
      {groups.map((group) => (
        <optgroup key={group} label={group}>
          {CONTENT_TYPES.filter((t) => t.group === group).map((type) => (
            <option key={type.slug} value={type.slug}>
              {type.label}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
