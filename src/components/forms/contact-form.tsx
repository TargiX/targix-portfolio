"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { sendContact, type ContactFormState } from "@/app/actions/contact";
import { cn } from "@/lib/utils";

const INITIAL_STATE: ContactFormState = { ok: false, version: 0 };

export function ContactForm({ disabled = false }: { disabled?: boolean }) {
  const [state, formAction, isPending] = useActionState(sendContact, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasFieldErrors = !!state.fieldErrors && Object.keys(state.fieldErrors).length > 0;

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setShowSuccess(true);
      const id = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(id);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 sm:grid-cols-2"
      aria-label="Contact form"
    >
      <Field
        label="name"
        name="name"
        error={state.fieldErrors?.name}
        required
        maxLength={80}
        disabled={disabled}
      />
      <Field
        label="email"
        name="email"
        type="email"
        error={state.fieldErrors?.email}
        required
        maxLength={120}
        disabled={disabled}
      />

      <div className="sm:col-span-2">
        <label className="mb-1 block text-[10px] lowercase tracking-[0.1em] text-fg-dim">
          message
        </label>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={2000}
          disabled={disabled}
          placeholder="what you're building, what you need, what you'd want me to do…"
          className="w-full resize-none rounded-sm border border-line bg-bg-2/40 px-2.5 py-2 font-mono text-[12px] text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-[var(--accent)]"
          aria-invalid={!!state.fieldErrors?.message}
        />
        {state.fieldErrors?.message && (
          <div className="mt-1 text-[10px] text-red-400">{state.fieldErrors.message}</div>
        )}
      </div>

      {/* honeypot — visually hidden, real-looking name */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}
      >
        <label>
          website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={disabled || isPending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] transition-[background-color,border-color,color,transform]",
            disabled || isPending
              ? "border-line text-fg-dim"
              : "border-line bg-bg-2 text-fg hover:border-[var(--accent)] hover:text-[var(--accent)] active:translate-y-px",
          )}
        >
          {disabled ? "email directly" : isPending ? "sending…" : "send message"}
        </button>

        <div className="text-[10px] lowercase tracking-[0.08em] text-fg-dim">
          server action · resend · zod · react 19 useActionState
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="sm:col-span-2 inline-flex items-center gap-2 rounded-sm border border-[color:color-mix(in_oklab,var(--accent)_50%,var(--line))] bg-bg-2/60 px-3 py-1.5 font-mono text-[11px] text-fg"
          >
            <Check className="size-3 text-[var(--accent)]" />
            sent — i&apos;ll get back to you soon.
          </motion.div>
        )}
      </AnimatePresence>

      {state.error && !hasFieldErrors && (
        <div className="sm:col-span-2 text-[10px] text-red-400">{state.error}</div>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-[10px] lowercase tracking-[0.1em] text-fg-dim">
        {label}
      </label>
      <input
        type={type}
        name={name}
        className="w-full rounded-sm border border-line bg-bg-2/40 px-2.5 py-1.5 font-mono text-[12px] text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-[var(--accent)]"
        aria-invalid={!!error}
        {...rest}
      />
      {error && <div className="mt-1 text-[10px] text-red-400">{error}</div>}
    </div>
  );
}
