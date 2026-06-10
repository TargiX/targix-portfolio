"use server";

import { z } from "zod";
import { Resend } from "resend";

import { checkRateLimit } from "@/lib/rate-limit";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(80, "too long"),
  email: z.string().trim().email("must be a valid email"),
  message: z.string().trim().min(8, "tell me more than that").max(2000, "too long"),
  website: z.string().optional().default(""),
});

export type ContactFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
  version: number;
};

const TO_EMAIL = process.env.CONTACT_TO ?? "targix8@gmail.com";
// Defaults to Resend's shared sender for first-run; override with your verified domain
// (e.g. CONTACT_FROM="Ilya <targix@phosphene.cc>") for branded delivery.
const FROM_EMAIL = process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";

export async function sendContact(
  prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        typeof key === "string" &&
        (key === "name" || key === "email" || key === "message") &&
        !fieldErrors[key]
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      ok: false,
      error: "fix the highlighted fields",
      fieldErrors,
      version: prev.version,
    };
  }

  // honeypot tripped → fail silently, look successful
  if (parsed.data.website) {
    return { ok: true, version: prev.version + 1 };
  }

  const rateLimit = await checkRateLimit({
    namespace: "contact",
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    return {
      ok: false,
      error: `too many messages; try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)}m`,
      version: prev.version,
    };
  }

  const { name, email, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[contact] RESEND_API_KEY not set — skipped delivery.");
    }
    return {
      ok: false,
      error: "contact form is not configured; use the email link instead",
      version: prev.version,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Portfolio · ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    if (error) {
      console.error("[contact] resend error:", error);
      return {
        ok: false,
        error: "send failed; try the email link instead",
        version: prev.version,
      };
    }
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return {
      ok: false,
      error: "send failed; try the email link instead",
      version: prev.version,
    };
  }

  return { ok: true, version: prev.version + 1 };
}
