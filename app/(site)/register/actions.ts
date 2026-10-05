"use server";

import { z } from "zod";
import { db } from "@/db";
import { eventRegistrations } from "@/db/schema";
import { EVENT, registrationClosed } from "@/lib/event";

export type RegisterState = {
  /** "success" for a new registration; "already" when this email had registered before. */
  status?: "success" | "already";
  error?: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "email", string>>;
  /** What was typed, so a failed attempt does not lose it. */
  values?: { name: string; phone: string; email: string };
  /** The name registered, for the confirmation. */
  name?: string;
};

const schema = z.object({
  /* A leading = + - @ is stripped from names so a cell can never read as a formula. */
  name: z
    .string()
    .trim()
    .transform((value) => value.replace(/^[=+\-@\s]+/, "").replace(/\s+/g, " "))
    .pipe(z.string().min(2, "Enter your full name.").max(120, "That name is too long.")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s\-().]*$/, "Enter a valid phone number, for example 0803 123 4567.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }, "Enter a valid phone number, for example 0803 123 4567."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.").max(254, "That email address is too long.")),
});

/**
 * Saves a registration. The media team reads them in the site manager
 * (/admin/registrations), where they can also download them as a CSV.
 * One email address can register once per event.
 */
export async function register(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  if (registrationClosed()) {
    return { error: "Registration for this event has closed.", values: raw };
  }

  /* A hidden field no person sees or fills: a bot that fills it is thanked and ignored. */
  if (String(formData.get("company") ?? "") !== "") {
    return { status: "success", name: raw.name };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: NonNullable<RegisterState["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === "name" || key === "phone" || key === "email") && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors, values: raw };
  }

  try {
    const saved = await db
      .insert(eventRegistrations)
      .values({ event: EVENT.key, ...parsed.data })
      .onConflictDoNothing({ target: [eventRegistrations.event, eventRegistrations.email] })
      .returning({ id: eventRegistrations.id });

    return { status: saved.length > 0 ? "success" : "already", name: parsed.data.name };
  } catch (error) {
    console.error("[register] could not save the registration:", error);
    return {
      error:
        "We couldn't save your registration just now. Please check your details and try again in a moment.",
      values: raw,
    };
  }
}
