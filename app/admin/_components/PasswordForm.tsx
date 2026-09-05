"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, type TeamState } from "../_actions/team";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-10 font-bold">
      {pending ? "Saving…" : "Change password"}
      {!pending && <KeyRound data-icon="inline-end" />}
    </Button>
  );
}

export default function PasswordForm() {
  const [state, formAction] = useActionState<TeamState, FormData>(
    changePassword,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border bg-card p-5 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="current">Current password</Label>
        <Input
          id="current"
          name="current"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="next">New password</Label>
        <Input
          id="next"
          name="next"
          type="password"
          required
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          At least 10 characters, including letters and numbers.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm font-semibold text-secondary-foreground">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {state.success}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
