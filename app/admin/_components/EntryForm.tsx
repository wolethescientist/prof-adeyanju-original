"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ICON_NAMES, resolveIcon } from "@/app/lib/icons";
import type { Field } from "@/lib/cms/registry";
import type { MediaItem } from "@/lib/cms/media-types";
import { cn } from "@/lib/utils";
import type { FormState } from "../_actions/content";
import AttachmentField from "./editor/AttachmentField";
import { EditorProvider } from "./editor/context";
import GalleryField from "./editor/GalleryField";
import ImageField from "./editor/ImageField";
import { FieldError, FieldHelp, FieldLabel } from "./editor/parts";
import RichTextField from "./editor/RichTextField";

type Props = {
  /** Serialisable slice of the registry entry — the Drizzle table cannot cross
      the server/client boundary. */
  spec: {
    slug: string;
    label: string;
    singular: string;
    fields: Field[];
    titleField: string;
    article: boolean;
  };
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Record<string, unknown>;
  images: MediaItem[];
  files: MediaItem[];
  submitLabel: string;
  /** The entry's public page, when it has one and is live. */
  viewHref?: string | null;
};

function SubmitButton({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className={cn("h-11 font-bold px-6", className)}>
      {pending ? "Saving…" : label}
      {!pending && <Save data-icon="inline-end" />}
    </Button>
  );
}

/** A textarea that grows with what is typed — for titles and summaries. */
function GrowingText({
  field,
  defaultValue,
  error,
  className,
}: {
  field: Field;
  defaultValue: string;
  error?: string;
  className: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [length, setLength] = useState(defaultValue.length);

  const fit = () => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };
  useEffect(fit, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={field.name} className="sr-only">
        {field.label}
      </label>
      <textarea
        ref={ref}
        id={field.name}
        name={field.name}
        rows={1}
        defaultValue={defaultValue}
        required={field.required}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={field.help ? `${field.name}-help` : undefined}
        onKeyDown={(event) => {
          /* Enter in a title doesn't start a new line (or submit the form). */
          if (field.appearance === "headline" && event.key === "Enter") event.preventDefault();
        }}
        onInput={(event) => {
          fit();
          setLength(event.currentTarget.value.length);
          /* A title is one line of text, however long it wraps. */
          if (field.appearance === "headline") {
            event.currentTarget.value = event.currentTarget.value.replace(/\n/g, " ");
          }
        }}
        className={cn(
          "w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none placeholder:text-muted-foreground/45 focus:ring-0",
          className
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          {error && <FieldError message={error} />}
          <FieldHelp field={field} />
        </div>
        {field.maxLength && length > field.maxLength * 0.8 && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {length} / {field.maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * A few fixed options, as a row of buttons — e.g. who an award went to. With
 * `appearance: "kind"` each option is a card with a line of explanation, for
 * the question the team answers first.
 */
function ChoiceField({
  field,
  defaultValue,
  error,
  onChange,
}: {
  field: Field;
  defaultValue: string;
  error?: string;
  onChange?: (value: string) => void;
}) {
  const options = field.options ?? [];
  const [value, setValue] = useState(defaultValue || options[0]?.value || "");
  const kind = field.appearance === "kind";
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={cn("mb-2 font-semibold", kind ? "text-base" : "text-sm")}>{field.label}</legend>
      <div className={cn("grid gap-2", kind ? "sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-2")}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer rounded-xl border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              kind
                ? "flex-col gap-1 px-4 py-3 text-left"
                : "items-center justify-center whitespace-nowrap px-2 py-2.5 text-center text-[0.8rem] font-semibold",
              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <input
              type="radio"
              name={field.name}
              value={option.value}
              checked={value === option.value}
              onChange={() => {
                setValue(option.value);
                onChange?.(option.value);
              }}
              className="sr-only"
            />
            <span className={cn(kind && "text-sm font-semibold")}>{option.label}</span>
            {kind && option.help && (
              <span
                className={cn(
                  "text-xs font-normal leading-snug",
                  value === option.value ? "text-primary-foreground/85" : "text-muted-foreground"
                )}
              >
                {option.help}
              </span>
            )}
          </label>
        ))}
      </div>
      {error && <FieldError message={error} />}
      <FieldHelp field={field} />
    </fieldset>
  );
}

/** A yes/no switch, on by default for a new entry. */
function ToggleField({ field, initial }: { field: Field; initial?: Record<string, unknown> }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={initial ? Boolean(initial[field.name]) : true}
          className="peer sr-only"
        />
        <span className="h-6 w-10 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{field.label}</span>
        {field.help && <span className="mt-0.5 block text-xs text-muted-foreground">{field.help}</span>}
      </span>
    </label>
  );
}

/** The initiative icon, chosen from a grid rather than a list of names. */
function IconField({ field, defaultValue }: { field: Field; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue || "Sparkles");
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
      <div className="grid grid-cols-6 gap-1.5">
        {ICON_NAMES.map((name) => {
          const Icon = resolveIcon(name);
          const active = value === name;
          return (
            <label
              key={name}
              title={name}
              className={cn(
                "grid aspect-square cursor-pointer place-items-center rounded-lg border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <input
                type="radio"
                name={field.name}
                value={name}
                checked={active}
                onChange={() => setValue(name)}
                className="sr-only"
              />
              <Icon className="size-4" aria-hidden="true" />
              <span className="sr-only">{name}</span>
            </label>
          );
        })}
      </div>
      <FieldHelp field={field} />
    </fieldset>
  );
}

/** Plain inputs: text, numbers, links, dates and longer notes. */
function PlainField({ field, defaultValue, error }: { field: Field; defaultValue: string; error?: string }) {
  const describedBy = field.help ? `${field.name}-help` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel field={field} htmlFor={field.name} />
      {field.type === "textarea" ? (
        <Textarea
          id={field.name}
          name={field.name}
          defaultValue={defaultValue}
          required={field.required}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          rows={4}
          className="bg-background"
        />
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={
            field.type === "number"
              ? "number"
              : field.type === "url"
                ? "url"
                : field.type === "date"
                  ? "date"
                  : "text"
          }
          defaultValue={defaultValue}
          required={field.required}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-10 bg-background"
        />
      )}
      {error && <FieldError message={error} />}
      <FieldHelp field={field} />
    </div>
  );
}

export default function EntryForm({
  spec,
  action,
  initial,
  images,
  files,
  submitLabel,
  viewHref,
}: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const errors = state.fieldErrors ?? {};
  const form = useRef<HTMLFormElement>(null);
  const dirty = useRef(false);

  /* Leaving with unsaved writing asks first. */
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const value = (name: string) => {
    const raw = initial?.[name];
    return raw === null || raw === undefined ? "" : String(raw);
  };

  /* The answer to each choice, so fields can follow it: an award shows
     "Awarded to", a lecture says "Hosted by". */
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      spec.fields
        .filter((field) => field.type === "choice")
        .map((field) => [field.name, value(field.name) || field.options?.[0]?.value || ""])
    )
  );

  const render = (original: Field) => {
    const follows = original.showWhen?.field ?? original.watch;
    const answer = follows ? choices[follows] : undefined;
    if (original.showWhen && !original.showWhen.values.includes(answer ?? "")) return null;
    const field: Field = {
      ...original,
      label: (answer && original.labelWhen?.[answer]) || original.label,
      placeholder: (answer && original.placeholderWhen?.[answer]) ?? original.placeholder,
    };
    const error = errors[field.name];
    switch (field.type) {
      case "image":
        return <ImageField key={field.name} field={field} defaultValue={value(field.name)} error={error} />;
      case "gallery":
        return (
          <GalleryField
            key={field.name}
            field={field}
            defaultValue={Array.isArray(initial?.[field.name]) ? (initial[field.name] as string[]) : []}
            error={error}
          />
        );
      case "attachment":
        return <AttachmentField key={field.name} field={field} defaultValue={value(field.name)} error={error} />;
      case "richtext":
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <FieldLabel field={field} />
            <RichTextField field={field} defaultValue={value(field.name)} error={error} />
          </div>
        );
      case "choice":
        return (
          <ChoiceField
            key={field.name}
            field={field}
            defaultValue={value(field.name)}
            error={error}
            onChange={(next) => setChoices((current) => ({ ...current, [field.name]: next }))}
          />
        );
      case "toggle":
        return <ToggleField key={field.name} field={field} initial={initial} />;
      case "icon":
        return <IconField key={field.name} field={field} defaultValue={value(field.name)} />;
      default:
        if (field.appearance === "headline") {
          return (
            <GrowingText
              key={field.name}
              field={field}
              defaultValue={value(field.name)}
              error={error}
              className="font-heading text-[2.4rem] font-medium leading-[1.12] tracking-[-0.02em] md:text-5xl"
            />
          );
        }
        if (field.appearance === "lead") {
          return (
            <GrowingText
              key={field.name}
              field={field}
              defaultValue={value(field.name)}
              error={error}
              className="text-lg leading-relaxed text-muted-foreground md:text-xl"
            />
          );
        }
        return <PlainField key={field.name} field={field} defaultValue={value(field.name)} error={error} />;
    }
  };

  const published = (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial ? Boolean(initial.published) : true}
          className="peer sr-only"
        />
        <span className="h-6 w-10 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold">Show on the website</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          Turn off to keep it saved but hidden from visitors.
        </span>
      </span>
    </label>
  );

  const formError = state.error && (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
    >
      <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
      {state.error}
    </p>
  );
  const hasFieldErrors = Object.keys(errors).length > 0;
  const fieldErrorNote = hasFieldErrors && (
    <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
      <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
      Some fields need attention — they’re marked in red.
    </p>
  );

  const cancel = (
    <Button
      variant="ghost"
      size="lg"
      className="h-11 font-semibold"
      nativeButton={false}
      render={<Link href={`/admin/content/${spec.slug}`} />}
    >
      Cancel
    </Button>
  );

  const formProps = {
    ref: form,
    action: formAction,
    onInput: () => (dirty.current = true),
    onChange: () => (dirty.current = true),
    onSubmit: () => (dirty.current = false),
  };

  if (spec.article) {
    const kind = spec.fields.find((field) => field.appearance === "kind");
    const main = spec.fields.filter((field) => field.placement !== "side" && field !== kind);
    const side = spec.fields.filter((field) => field.placement === "side");
    const cover = main.find((field) => field.appearance === "cover");
    const writing = main.filter((field) => field !== cover);

    return (
      <EditorProvider images={images} files={files} titleField={spec.titleField}>
        <form {...formProps} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          {kind && (
            <div className="rounded-2xl border bg-card p-5 lg:col-span-2">{render(kind)}</div>
          )}
          <div className="min-w-0 overflow-hidden rounded-2xl border bg-card">
            {cover && render(cover)}
            <div className="flex flex-col gap-8 px-6 py-8 md:px-8">
              {writing.map(render)}
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
            <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
              {published}
              {fieldErrorNote}
              {formError}
              <div className="flex items-center gap-2">
                <SubmitButton label={submitLabel} className="grow" />
                {cancel}
              </div>
              {viewHref && (
                <a
                  href={viewHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  View this page on the website
                </a>
              )}
            </div>
            <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground">
                Details
              </p>
              {side.map(render)}
            </div>
          </aside>

          {/* On a phone the side panel comes after the whole story, so the
              save button also rides along the bottom of the screen. */}
          <div className="sticky bottom-0 z-20 -mx-5 flex items-center gap-3 border-t bg-card/95 px-5 py-3 backdrop-blur-sm lg:hidden">
            <SubmitButton label={submitLabel} className="grow" />
            {cancel}
          </div>
        </form>
      </EditorProvider>
    );
  }

  return (
    <EditorProvider images={images} files={files} titleField={spec.titleField}>
      <form {...formProps} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          {spec.fields.map(render)}
        </div>
        <div className="rounded-2xl border bg-card p-5">{published}</div>
        {fieldErrorNote}
        {formError}
        <div className="flex items-center gap-3">
          <SubmitButton label={submitLabel} />
          {cancel}
        </div>
      </form>
    </EditorProvider>
  );
}
