"use server";

import { z } from "zod";
import { Resend } from "resend";

import { checkRateLimit } from "@/lib/rate-limit";
import {
  anonymizedDistinctId,
  captureServerEvent,
  getRequestDistinctId,
} from "@/lib/posthog-server";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(80, "too long"),
  email: z.string().trim().email("must be a valid email"),
  message: z.string().trim().min(8, "tell me more than that").max(2000, "too long"),
  context: z
    .string()
    .trim()
    .min(1, "case study context is required")
    .max(160, "too long")
    .refine((value) => !/[\r\n]/.test(value), "must be a single line"),
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
    context: formData.get("context"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    let contextError = false;
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        typeof key === "string" &&
        (key === "name" || key === "email" || key === "message") &&
        !fieldErrors[key]
      ) {
        fieldErrors[key] = issue.message;
      }
      if (key === "context") {
        contextError = true;
      }
    }
    return {
      ok: false,
      error: contextError
        ? "case study context is missing or invalid; reopen this form from its case study"
        : "fix the highlighted fields",
      fieldErrors,
      version: prev.version,
    };
  }

  const { name, email, message, context } = parsed.data;
  const emailDomain = email.split("@")[1]?.toLowerCase() ?? "unknown";
  const distinctId = await getRequestDistinctId(anonymizedDistinctId("contact", email));
  const baseProperties = {
    source: "contact_form",
    context,
    email_domain: emailDomain,
    name_length: name.length,
    message_length: message.length,
  };

  // honeypot tripped → fail silently, look successful
  if (parsed.data.website) {
    await captureServerEvent({
      distinctId,
      event: "contact_form_spam_trapped",
      properties: baseProperties,
    });
    return { ok: true, version: prev.version + 1 };
  }

  const rateLimit = await checkRateLimit({
    namespace: "contact",
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    await captureServerEvent({
      distinctId,
      event: "contact_form_rate_limited",
      properties: {
        ...baseProperties,
        retry_after_seconds: rateLimit.retryAfterSeconds,
      },
    });
    return {
      ok: false,
      error: `too many messages; try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)}m`,
      version: prev.version,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[contact] RESEND_API_KEY not set — skipped delivery.");
    }
    await captureServerEvent({
      distinctId,
      event: "contact_form_send_failed",
      properties: {
        ...baseProperties,
        delivery_provider: "unconfigured",
        error_name: "missing_resend_api_key",
      },
    });
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
      subject: `Portfolio · ${name}${context ? ` · ${context}` : ""}`,
      text: `From: ${name} <${email}>${context ? `\nContext: ${context}` : ""}\n\n${message}`,
    });
    if (error) {
      console.error("[contact] resend error:", error);
      await captureServerEvent({
        distinctId,
        event: "contact_form_send_failed",
        properties: {
          ...baseProperties,
          delivery_provider: "resend",
          error_name: "resend_error",
        },
      });
      return {
        ok: false,
        error: "send failed; try the email link instead",
        version: prev.version,
      };
    }
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    await captureServerEvent({
      distinctId,
      event: "contact_form_send_failed",
      properties: {
        ...baseProperties,
        delivery_provider: "resend",
        error_name: err instanceof Error ? err.name : "unknown_error",
      },
    });
    return {
      ok: false,
      error: "send failed; try the email link instead",
      version: prev.version,
    };
  }

  await captureServerEvent({
    distinctId,
    event: "contact_form_submitted",
    properties: {
      ...baseProperties,
      delivery_provider: "resend",
      sent: true,
    },
  });

  return { ok: true, version: prev.version + 1 };
}
