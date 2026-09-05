"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createUser, type TeamState } from "../_actions/team";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-10 font-bold">
      {pending ? "Adding…" : "Add to the team"}
      {!pending && <UserPlus data-icon="inline-end" />}
    </Button>
  );
}

export default function AddUserForm() {
  const [state, formAction] = useActionState<TeamState, FormData>(createUser, {});
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
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required maxLength={200} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="new-email">Email address</Label>
        <Input
          id="new-email"
          name="email"
          type="email"
          required
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue="editor">
          <option value="editor">Editor — can add and edit all content</option>
          <option value="admin">
            Administrator — can also manage the team
          </option>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="new-password">Temporary password</Label>
        <Input
          id="new-password"
          name="password"
          type="text"
          required
          autoComplete="off"
          placeholder="At least 10 characters, letters and numbers"
        />
        <p className="text-xs text-muted-foreground">
          Share this privately and ask them to change it after signing in.
        </p>
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
        <p className="flex items-start gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm font-semibold text-secondary-foreground">
          <CheckCircle2 className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          {state.success}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
