import { AlertCircle } from "lucide-react";
import type { Field } from "@/lib/cms/registry";

/** A field's label, with "optional" beside the ones that are. */
export function FieldLabel({ field, htmlFor }: { field: Field; htmlFor?: string }) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag
      {...(htmlFor ? { htmlFor } : {})}
      className="flex items-center gap-2 text-sm font-semibold text-foreground"
    >
      {field.label}
      {!field.required && (
        <span className="text-xs font-medium text-muted-foreground">optional</span>
      )}
    </Tag>
  );
}

export function FieldHelp({ field }: { field: Field }) {
  if (!field.help) return null;
  return (
    <p id={`${field.name}-help`} className="text-xs text-muted-foreground leading-relaxed">
      {field.help}
    </p>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-1.5 text-xs font-semibold text-destructive">
      <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
