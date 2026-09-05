"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ICON_NAMES } from "@/app/lib/icons";
import type { Field } from "@/lib/cms/registry";
import type { MediaItem } from "@/lib/cms/media";
import type { FormState } from "../_actions/content";

type Props = {
  /** Serialisable slice of the registry entry — the Drizzle table cannot cross
      the server/client boundary. */
  spec: { slug: string; label: string; singular: string; fields: Field[] };
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Record<string, unknown>;
  images: MediaItem[];
  submitLabel: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-11 font-bold px-6">
      {pending ? "Saving…" : label}
      {!pending && <Save data-icon="inline-end" />}
    </Button>
  );
}

/** Image chooser: a native select plus a live preview of the choice. */
function ImageField({
  field,
  images,
  defaultValue,
  error,
}: {
  field: Field;
  images: MediaItem[];
  defaultValue: string;
  error?: string;
}) {
  const [selected, setSelected] = useState(defaultValue);
  const chosen = images.find((image) => image.id === selected);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Select
        id={field.name}
        name={field.name}
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={field.help ? `${field.name}-help` : undefined}
      >
        <option value="">No image</option>
        {images.map((image) => (
          <option key={image.id} value={image.id}>
            {image.filename}
          </option>
        ))}
      </Select>

      {chosen && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/media/${chosen.id}?v=${chosen.checksum.slice(0, 12)}`}
          alt={chosen.alt}
          className="mt-1 h-32 w-auto rounded-lg border object-cover"
        />
      )}

      {field.help && (
        <p id={`${field.name}-help`} className="text-xs text-muted-foreground">
          {field.help}{" "}
          <Link href="/admin/media" className="underline hover:text-primary">
            Manage images
          </Link>
        </p>
      )}
      {error && <FieldError message={error} />}
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function EntryForm({
  spec,
  action,
  initial,
  images,
  submitLabel,
}: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const errors = state.fieldErrors ?? {};

  const value = (name: string) => {
    const raw = initial?.[name];
    return raw === null || raw === undefined ? "" : String(raw);
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {spec.fields.map((field) => {
        const error = errors[field.name];
        const describedBy = field.help ? `${field.name}-help` : undefined;

        if (field.type === "image") {
          return (
            <ImageField
              key={field.name}
              field={field}
              images={images}
              defaultValue={value(field.name)}
              error={error}
            />
          );
        }

        return (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {!field.required && (
                <span className="text-xs font-medium text-muted-foreground">
                  optional
                </span>
              )}
            </Label>

            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                defaultValue={value(field.name)}
                required={field.required}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                rows={4}
              />
            ) : field.type === "icon" ? (
              <Select
                id={field.name}
                name={field.name}
                defaultValue={value(field.name) || "Sparkles"}
                aria-describedby={describedBy}
              >
                {ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id={field.name}
                name={field.name}
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "url"
                      ? "url"
                      : "text"
                }
                defaultValue={value(field.name)}
                required={field.required}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
              />
            )}

            {field.help && (
              <p id={`${field.name}-help`} className="text-xs text-muted-foreground">
                {field.help}
              </p>
            )}
            {error && <FieldError message={error} />}
          </div>
        );
      })}

      <label className="flex items-start gap-3 rounded-xl border bg-card p-4 cursor-pointer">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial ? Boolean(initial.published) : true}
          className="mt-0.5 size-4 accent-primary cursor-pointer"
        />
        <span>
          <span className="block text-sm font-semibold">Show on the website</span>
          <span className="block text-xs text-muted-foreground mt-0.5">
            Uncheck to keep this saved but hidden from visitors.
          </span>
        </span>
      </label>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <Button
          variant="ghost"
          size="lg"
          className="h-11 font-semibold"
          nativeButton={false}
          render={<Link href={`/admin/content/${spec.slug}`} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
