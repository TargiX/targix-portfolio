"use client";

import { useActionState, useEffect, useOptimistic, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  signGuestbook,
  type GuestbookFormState,
} from "@/app/actions/guestbook";
import type { GuestbookEntry } from "@/db/schema";
import { cn } from "@/lib/utils";

type OptimisticEntry = Pick<GuestbookEntry, "id" | "name" | "message" | "createdAt"> & {
  pending?: boolean;
};

const INITIAL_STATE: GuestbookFormState = { ok: false, version: 0 };

function relativeTime(d: Date | number) {
  const date = d instanceof Date ? d : new Date(d * 1000);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function GuestbookForm({ initial }: { initial: OptimisticEntry[] }) {
  const [state, formAction, isPending] = useActionState(signGuestbook, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  const [entries, addOptimistic] = useOptimistic<OptimisticEntry[], OptimisticEntry>(
    initial,
    (prev, next) => [next, ...prev].slice(0, 8),
  );

  // Reset form on each successful submit (state.version bumps).
  const [lastVersion, setLastVersion] = useState(0);
  useEffect(() => {
    if (state.ok && state.version !== lastVersion) {
      setLastVersion(state.version);
      formRef.current?.reset();
    }
  }, [state, lastVersion]);

  // We need to wrap formAction so we can call addOptimistic with form data BEFORE the action.
  const submit = (formData: FormData) => {
    const name = String(formData.get("name") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    if (name && message) {
      addOptimistic({
        id: -Date.now(),
        name,
        message,
        createdAt: new Date(),
        pending: true,
      });
    }
    formAction(formData);
  };

  return (
    <div className="grid gap-7 sm:grid-cols-[1fr_1.3fr]">
      {/* Form */}
      <form
        ref={formRef}
        action={submit}
        className="flex flex-col gap-3 rounded-md border border-line-soft bg-bg-2/40 p-4"
        aria-label="Sign the guestbook"
      >
        <div>
          <label className="mb-1 block text-[10px] lowercase tracking-[0.1em] text-fg-dim">
            name
          </label>
          <input
            name="name"
            maxLength={40}
            required
            placeholder="who's saying hi"
            className="w-full rounded-sm border border-line bg-bg px-2.5 py-1.5 font-mono text-[12px] text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-[var(--accent)]"
            aria-invalid={!!state.fieldErrors?.name}
            aria-errormessage="name-err"
          />
          {state.fieldErrors?.name && (
            <div id="name-err" className="mt-1 text-[10px] text-red-400">
              {state.fieldErrors.name}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[10px] lowercase tracking-[0.1em] text-fg-dim">
            message
          </label>
          <textarea
            name="message"
            maxLength={240}
            required
            placeholder="leave a note for the next visitor"
            rows={3}
            className="w-full resize-none rounded-sm border border-line bg-bg px-2.5 py-1.5 font-mono text-[12px] text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-[var(--accent)]"
            aria-invalid={!!state.fieldErrors?.message}
            aria-errormessage="msg-err"
          />
          {state.fieldErrors?.message && (
            <div id="msg-err" className="mt-1 text-[10px] text-red-400">
              {state.fieldErrors.message}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] lowercase tracking-[0.08em] text-fg-dim">
            stored in libsql · server action · zod
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "rounded-sm border px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] transition-all",
              isPending
                ? "border-line text-fg-dim"
                : "border-line bg-bg-2 text-fg hover:border-[var(--accent)] hover:text-[var(--accent)] active:translate-y-px",
            )}
          >
            {isPending ? "signing…" : "sign"}
          </button>
        </div>

        {state.error && !state.fieldErrors && (
          <div className="text-[10px] text-red-400">{state.error}</div>
        )}
      </form>

      {/* List */}
      <div>
        <div className="mb-3 text-[10px] lowercase tracking-[0.1em] text-fg-dim">
          recent visitors · {entries.length}
        </div>
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-line-soft px-3 py-6 text-center text-[11px] text-fg-dim">
            be the first to leave a note.
          </div>
        ) : (
          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {entries.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className={cn(
                    "rounded-md border border-line-soft bg-bg-2/30 px-3 py-2 transition-opacity",
                    e.pending && "opacity-60",
                  )}
                >
                  <div className="mb-0.5 flex items-baseline justify-between gap-3 text-[10px] lowercase text-fg-dim">
                    <span className="text-fg-muted">{e.name}</span>
                    <span>{e.pending ? "sending…" : relativeTime(e.createdAt as Date | number)}</span>
                  </div>
                  <p className="m-0 font-mono text-[12px] leading-[1.5] text-fg">{e.message}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
