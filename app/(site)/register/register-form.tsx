"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT } from "@/lib/event";
import { register, type RegisterState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-12 w-full text-sm font-bold">
      {pending ? "Registering…" : "Register to attend"}
      {!pending && <ArrowRight data-icon="inline-end" />}
    </Button>
  );
}

function Problem({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useActionState<RegisterState, FormData>(register, {});
  const errors = state.fieldErrors ?? {};

  if (state.status) {
    const already = state.status === "already";
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          {already ? "You are already registered" : "You are registered"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {already
            ? `${state.name ? `${state.name}, we` : "We"} already have a registration with that email address, so there is nothing more to do.`
            : `Thank you${state.name ? `, ${state.name.split(" ")[0]}` : ""}. We have your registration for the ${EVENT.name} on ${EVENT.dateLabel} at ${EVENT.venue}, ${EVENT.place}.`}
        </p>
        <Button
          variant="outline"
          className="h-11 rounded-lg bg-card px-6 text-sm font-bold"
          nativeButton={false}
          render={<Link href={EVENT.announcementPath} />}
        >
          Back to the announcement
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          defaultValue={state.values?.name}
          placeholder="Your full name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="h-11 bg-background"
        />
        <Problem id="name-error" message={errors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          maxLength={25}
          defaultValue={state.values?.phone}
          placeholder="0803 123 4567"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className="h-11 bg-background"
        />
        <Problem id="phone-error" message={errors.phone} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={state.values?.email}
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="h-11 bg-background"
        />
        <Problem id="email-error" message={errors.email} />
      </div>

      {/* A trap for bots: invisible to people, tempting to scripts. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <SubmitButton />
      <p className="text-xs text-muted-foreground">
        We use these details only to organise the event.
      </p>
    </form>
  );
}
