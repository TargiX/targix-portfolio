"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, RotateCcw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Choice = {
  id: string;
  label: string;
  detail: string;
};

const CONTEXTS: Choice[] = [
  {
    id: "new",
    label: "First visit",
    detail: "a new evaluator meets the work cold",
  },
  {
    id: "handoff",
    label: "Critical handoff",
    detail: "a team needs the next move to be obvious",
  },
  {
    id: "recovery",
    label: "Trust recovery",
    detail: "a user needs a safe way back after friction",
  },
];

const CLAIMS: Choice[] = [
  {
    id: "clarity",
    label: "Clarity earns action",
    detail: "make the intended next step legible",
  },
  {
    id: "control",
    label: "Control earns trust",
    detail: "show the reversible decision before commitment",
  },
  {
    id: "proof",
    label: "Proof earns belief",
    detail: "turn a capability claim into observable evidence",
  },
];

const WINDOWS: Choice[] = [
  {
    id: "session",
    label: "One focused session",
    detail: "watch the first meaningful interaction",
  },
  {
    id: "week",
    label: "Seven days",
    detail: "look for return and completion patterns",
  },
  {
    id: "review",
    label: "One review cycle",
    detail: "collect the decision-maker's challenge",
  },
];

const SUCCESS_SIGNALS: Record<string, string> = {
  clarity:
    "The visitor reaches the intended action without asking where to begin.",
  control:
    "The visitor changes a decision, sees the consequence, and keeps moving.",
  proof:
    "The visitor can name the observed evidence they would use to approve the claim.",
};

const FALSIFIERS: Record<string, string> = {
  clarity:
    "People hesitate, explore unrelated controls, or ask for a walkthrough before acting.",
  control:
    "People treat the decision as irreversible or cannot predict what their choice changes.",
  proof:
    "The artifact still sounds persuasive but leaves no event, behavior, or decision to inspect.",
};

function ChoiceSet({
  label,
  choices,
  value,
  onChange,
}: {
  label: string;
  choices: Choice[];
  value?: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
        {label}
      </legend>
      <div className="mt-2 grid gap-2">
        {choices.map((choice) => {
          const selected = choice.id === value;
          return (
            <button
              key={choice.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(choice.id)}
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                selected
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-fg"
                  : "border-line-soft bg-bg-2/25 text-fg-muted hover:border-line hover:bg-bg-2/45 hover:text-fg",
              )}
            >
              <span className="block text-[13px] font-medium">
                {choice.label}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-fg-dim">
                {choice.detail}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function AssumptionLedger() {
  const [contextId, setContextId] = useState<string>();
  const [claimId, setClaimId] = useState<string>();
  const [windowId, setWindowId] = useState<string>();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const ledger = useMemo(() => {
    const context = CONTEXTS.find((choice) => choice.id === contextId);
    const claim = CLAIMS.find((choice) => choice.id === claimId);
    const window = WINDOWS.find((choice) => choice.id === windowId);
    if (!context || !claim || !window) return null;

    return {
      context,
      claim,
      window,
      success: SUCCESS_SIGNALS[claim.id],
      falsifier: FALSIFIERS[claim.id],
      reviewer:
        claim.id === "control"
          ? "product lead + affected operator"
          : "product lead + evaluator",
    };
  }, [claimId, contextId, windowId]);

  const clearChoices = () => {
    setContextId(undefined);
    setClaimId(undefined);
    setWindowId(undefined);
    setCopyStatus("idle");
  };

  const copyLedger = async () => {
    if (!ledger) return;
    const text = `If: ${ledger.context.label}\nThen: ${ledger.claim.label}\nUnless: ${ledger.falsifier}\n\nFirst action: Let someone use this surface during ${ledger.window.label.toLowerCase()}.\nSuccess: ${ledger.success}\nReviewer: ${ledger.reviewer}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line-soft bg-bg-2/20">
      <div className="border-b border-line-soft bg-[linear-gradient(125deg,color-mix(in_oklab,var(--accent)_12%,transparent),transparent_42%)] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">
              operator exercise
            </div>
            <h4 className="mt-2 text-[20px] font-medium tracking-[-0.025em] text-fg">
              Make one product bet inspectable.
            </h4>
          </div>
          <button
            type="button"
            onClick={clearChoices}
            disabled={!contextId && !claimId && !windowId}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 text-[11px] font-medium text-fg-muted transition hover:border-[var(--accent)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Clear choices
          </button>
        </div>
        <p className="mt-2 max-w-[66ch] text-[12px] leading-relaxed text-fg-muted">
          Pick the moment, claim, and evidence window. The ledger turns a
          portfolio assertion into a small experiment another person can
          challenge.
        </p>
      </div>

      <div className="grid gap-px bg-line-soft xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
        <div className="grid gap-5 bg-bg p-4 sm:grid-cols-3 sm:p-5 xl:grid-cols-1">
          <ChoiceSet
            label="01 · operating context"
            choices={CONTEXTS}
            value={contextId}
            onChange={(id) => {
              setContextId(id);
              setCopyStatus("idle");
            }}
          />
          <ChoiceSet
            label="02 · claim to test"
            choices={CLAIMS}
            value={claimId}
            onChange={(id) => {
              setClaimId(id);
              setCopyStatus("idle");
            }}
          />
          <ChoiceSet
            label="03 · evidence window"
            choices={WINDOWS}
            value={windowId}
            onChange={(id) => {
              setWindowId(id);
              setCopyStatus("idle");
            }}
          />
        </div>

        <section
          aria-label="Generated experiment ledger"
          className="bg-bg p-4 sm:p-5"
        >
          {ledger ? (
            <div className="flex h-full flex-col">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
                generated ledger
              </div>
              <div className="mt-4 grid overflow-hidden rounded-xl border border-line-soft sm:grid-cols-3">
                <LedgerLine
                  label="if"
                  value={ledger.context.label}
                  detail={ledger.context.detail}
                />
                <LedgerLine
                  label="then"
                  value={ledger.claim.label}
                  detail={ledger.claim.detail}
                  accent
                />
                <LedgerLine
                  label="unless"
                  value="the evidence says otherwise"
                  detail="reverse or redesign when the falsifier appears"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <LedgerNote
                  label="First action"
                  value={`Watch one person use this during ${ledger.window.label.toLowerCase()}.`}
                />
                <LedgerNote label="Human reviewer" value={ledger.reviewer} />
                <LedgerNote
                  label="Success signal"
                  value={ledger.success}
                  positive
                />
                <LedgerNote
                  label="Kill / falsifier"
                  value={ledger.falsifier}
                  warning
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
                <button
                  type="button"
                  onClick={copyLedger}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 text-[12px] font-semibold text-black transition hover:brightness-110 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {copyStatus === "copied" ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Clipboard className="size-4" aria-hidden="true" />
                  )}
                  {copyStatus === "copied" ? "Ledger copied" : "Copy ledger"}
                </button>
                <p
                  aria-live="polite"
                  className={cn(
                    "text-[11px]",
                    copyStatus === "error" ? "text-red-400" : "text-fg-dim",
                  )}
                >
                  {copyStatus === "error"
                    ? "Copy is unavailable here. Select the ledger text to save it."
                    : "A good claim has a visible way to be wrong."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-line p-6 text-center">
              <ShieldAlert
                className="size-6 text-[var(--accent)]"
                aria-hidden="true"
              />
              <h5 className="mt-3 text-[15px] font-medium text-fg">
                The ledger is waiting for a real bet.
              </h5>
              <p className="mt-2 max-w-[38ch] text-[12px] leading-relaxed text-fg-muted">
                Choose all three inputs to expose the first action, success
                event, and condition that should make the team stop.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function LedgerLine({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-32 border-b border-line-soft p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0",
        accent && "bg-[var(--accent)]/10",
      )}
    >
      <div
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.16em]",
          accent ? "text-[var(--accent)]" : "text-fg-dim",
        )}
      >
        {label}
      </div>
      <p className="mt-3 text-[15px] font-medium leading-snug text-fg">
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-fg-muted">{detail}</p>
    </div>
  );
}

function LedgerNote({
  label,
  value,
  positive = false,
  warning = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        warning
          ? "border-amber-500/35 bg-amber-500/5"
          : "border-line-soft bg-bg-2/25",
      )}
    >
      <div
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.12em]",
          positive
            ? "text-[var(--accent)]"
            : warning
              ? "text-amber-300"
              : "text-fg-dim",
        )}
      >
        {label}
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-fg-muted">
        {value}
      </p>
    </div>
  );
}
