"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CircleAlert, ClipboardList, Copy, Layers3 } from "lucide-react";

import { cn } from "@/lib/utils";

type DeliveryMode = "validate" | "clarify" | "ship";
type Constraint = "audience" | "integration" | "risk";
type CopyStatus = "idle" | "copied" | "error";

const DELIVERY_OPTIONS: Array<{ id: DeliveryMode; label: string; detail: string }> = [
  {
    id: "validate",
    label: "Validate the first signal",
    detail: "Prove that the workflow matters before committing to a full system.",
  },
  {
    id: "clarify",
    label: "Clarify the operating model",
    detail: "Make the handoffs, decisions, and ownership visible to the team.",
  },
  {
    id: "ship",
    label: "Ship around a known constraint",
    detail: "Build the narrowest reliable path around an integration or delivery deadline.",
  },
];

const CONSTRAINT_OPTIONS: Array<{ id: Constraint; label: string; detail: string }> = [
  {
    id: "audience",
    label: "The user problem is still fuzzy",
    detail: "The risk is solving a plausible problem for the wrong person.",
  },
  {
    id: "integration",
    label: "An external handoff is load-bearing",
    detail: "The product only works when it reaches another tool, team, or system cleanly.",
  },
  {
    id: "risk",
    label: "Trust or operational risk is high",
    detail: "The interface must make review, correction, and accountability explicit.",
  },
];

const DELIVERY_LANGUAGE: Record<DeliveryMode, { firstSlice: string; nonGoal: string; nextDecision: string }> = {
  validate: {
    firstSlice: "A guided intake that captures one real job, records the decision, and exposes the outcome back to the person who supplied it.",
    nonGoal: "Do not build permissions, automation breadth, or a general-purpose workspace before one repeatable signal exists.",
    nextDecision: "Choose one observable success event and one person who can judge it after a week of use.",
  },
  clarify: {
    firstSlice: "A shared review surface that turns a messy request into named decisions, an owner, and one visible next action.",
    nonGoal: "Do not hide disagreement inside an AI summary or create a dashboard before the decision boundary is understood.",
    nextDecision: "Name which decision requires human approval and what evidence lets that person approve it.",
  },
  ship: {
    firstSlice: "A constrained operator flow that validates inputs, makes the external handoff explicit, and preserves a recoverable draft when it fails.",
    nonGoal: "Do not expand into a platform rewrite or promise end-to-end automation while the external dependency is still the bottleneck.",
    nextDecision: "Define the failure state that must remain truthful when the handoff is delayed, rejected, or unavailable.",
  },
};

const CONSTRAINT_LANGUAGE: Record<Constraint, { risk: string; review: string }> = {
  audience: {
    risk: "A polished interface can optimize for the wrong job if the first user and their moment of urgency stay implicit.",
    review: "Put the first-user assumption and the first successful outcome in the review header, not in a hidden product doc.",
  },
  integration: {
    risk: "A convincing local flow can still fail the product if the handoff cannot be understood, retried, or audited.",
    review: "Show the handoff status, the owning system, and a recoverable next step in the same surface.",
  },
  risk: {
    risk: "Generated or automated output becomes dangerous when a user cannot see what changed, correct it, or explain an approval.",
    review: "Make the proposed output, the human correction, and the approval action distinct states rather than one success screen.",
  },
};

export function ScopeConsole() {
  const [brief, setBrief] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMode>("validate");
  const [constraint, setConstraint] = useState<Constraint>("audience");
  const [generated, setGenerated] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const copyVersion = useRef(0);

  const normalizedBrief = brief.trim();
  const canGenerate = normalizedBrief.length >= 24;
  const memo = useMemo(
    () => createMemo(normalizedBrief, delivery, constraint),
    [normalizedBrief, delivery, constraint],
  );

  function invalidateArtifact() {
    copyVersion.current += 1;
    setCopyStatus("idle");
    setGenerated(false);
  }

  function updateBrief(value: string) {
    invalidateArtifact();
    setBrief(value);
  }

  function updateDelivery(value: DeliveryMode) {
    invalidateArtifact();
    setDelivery(value);
  }

  function updateConstraint(value: Constraint) {
    invalidateArtifact();
    setConstraint(value);
  }

  async function copyMemo() {
    const version = ++copyVersion.current;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(memo.markdown);
      if (copyVersion.current === version) setCopyStatus("copied");
    } catch {
      if (copyVersion.current === version) setCopyStatus("error");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-line-soft/70 bg-bg/35">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 [background:radial-gradient(900px_440px_at_85%_0%,color-mix(in_oklab,var(--accent)_13%,transparent),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent)]"
      />
      <div className="relative grid xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-line-soft/70 p-5 sm:p-7 xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
            <span className="grid size-7 place-items-center rounded-md border border-line-soft bg-bg-2/45 text-[var(--accent)]">
              <Layers3 className="size-3.5" aria-hidden />
            </span>
            Configure the decision
          </div>
          <h2 className="mt-6 max-w-[14ch] font-sans text-[clamp(32px,5vw,58px)] font-medium leading-[0.94] tracking-[-0.045em] text-fg">
            Turn the fuzzy brief into a first slice.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[14px] leading-relaxed text-fg-muted">
            This is a scoping instrument, not an AI summary. State the work plainly, choose the pressure
            that matters now, then make the first product decision reviewable.
          </p>

          <label className="mt-8 block" htmlFor="scope-brief">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">Messy brief</span>
            <textarea
              id="scope-brief"
              value={brief}
              onChange={(event) => updateBrief(event.target.value)}
              rows={7}
              placeholder="Example: Support teams lose the context behind escalations. We need a faster way to turn a support thread into a reliable engineering handoff."
              className="mt-3 min-h-40 w-full resize-y rounded-2xl border border-line-soft bg-bg/60 px-4 py-3 text-[14px] leading-relaxed text-fg outline-none placeholder:text-fg-dim focus:border-[var(--accent)]/65 focus:ring-2 focus:ring-[var(--accent)]/15"
            />
            <span className="mt-2 block text-[11px] text-fg-dim">
              {normalizedBrief.length < 24
                ? `${Math.max(24 - normalizedBrief.length, 0)} more characters to make the outcome concrete.`
                : "Enough context to shape a first-slice memo."}
            </span>
          </label>

          <ChoiceGroup
            label="Delivery pressure"
            options={DELIVERY_OPTIONS}
            value={delivery}
            onChange={updateDelivery}
          />
          <ChoiceGroup
            label="Load-bearing constraint"
            options={CONSTRAINT_OPTIONS}
            value={constraint}
            onChange={updateConstraint}
          />

          <button
            type="button"
            disabled={!canGenerate}
            onClick={() => {
              setCopyStatus("idle");
              setGenerated(true);
            }}
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 font-mono text-[12px] lowercase tracking-[0.06em] text-bg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Shape the first slice
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="min-w-0 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              <ClipboardList className="size-4 text-[var(--accent)]" aria-hidden />
              {generated ? "Reviewable scope memo" : "Your scope memo will appear here"}
            </div>
            {generated && (
              <button
                type="button"
                onClick={copyMemo}
                aria-describedby="scope-copy-status"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-line-soft bg-bg-2/30 px-3 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-muted transition hover:border-[var(--accent)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <Copy className="size-3.5" aria-hidden />
                Copy memo
              </button>
            )}
          </div>

          {generated ? (
            <article className="mt-5 space-y-5">
              <section className="rounded-2xl border border-line-soft bg-bg-2/18 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">Working premise</div>
                <p className="mt-3 text-[18px] leading-relaxed text-fg">{memo.premise}</p>
              </section>
              <MemoRow n="01" label="First slice" body={memo.firstSlice} />
              <MemoRow n="02" label="Keep out of this round" body={memo.nonGoal} muted />
              <MemoRow n="03" label="Risk to make visible" body={memo.risk} />
              <MemoRow n="04" label="Review contract" body={memo.review} />
              <MemoRow n="05" label="Decision before build" body={memo.nextDecision} />
              <p id="scope-copy-status" aria-live="polite" className="min-h-5 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
                {copyStatus === "copied"
                  ? "Scope memo copied. Paste it into the product or engineering conversation."
                  : copyStatus === "error"
                    ? "Could not copy the memo. Select the visible memo and copy it manually."
                    : "This memo is generated from the current brief and constraints."}
              </p>
            </article>
          ) : (
            <div className="mt-5 grid min-h-[440px] place-items-center rounded-2xl border border-dashed border-line-soft bg-bg-2/12 p-8 text-center">
              <div className="max-w-[32ch]">
                <CircleAlert className="mx-auto size-5 text-[var(--accent)]" aria-hidden />
                <p className="mt-4 text-[15px] font-medium text-fg">No fake output before the decision exists.</p>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                  A useful scope starts with a real constraint. Add the brief, pick the pressure, and the memo will make the bet and its boundary explicit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: T; label: string; detail: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="mt-7">
      <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">{label}</legend>
      <div className="mt-3 overflow-hidden rounded-2xl border border-line-soft bg-bg-2/16">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "group flex w-full items-start justify-between gap-4 border-t border-line-soft/70 px-4 py-3 text-left first:border-t-0 focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]",
                selected ? "bg-[var(--accent)]/[0.045] shadow-[inset_3px_0_0_var(--accent)]" : "hover:bg-bg-2/32",
              )}
            >
              <span>
                <span className="block text-[13px] font-medium text-fg">{option.label}</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-fg-muted">{option.detail}</span>
              </span>
              <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[var(--accent)]", selected ? "opacity-100" : "opacity-0 group-hover:opacity-35")}>
                <Check className="size-3.5" aria-hidden />
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function MemoRow({ n, label, body, muted = false }: { n: string; label: string; body: string; muted?: boolean }) {
  return (
    <section className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 border-t border-line-soft/70 pt-4">
      <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--accent)]">{n}</span>
      <div>
        <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">{label}</h3>
        <p className={cn("mt-2 text-[13px] leading-relaxed", muted ? "text-fg-dim" : "text-fg-muted")}>{body}</p>
      </div>
    </section>
  );
}

function createMemo(brief: string, delivery: DeliveryMode, constraint: Constraint) {
  const deliveryLanguage = DELIVERY_LANGUAGE[delivery];
  const constraintLanguage = CONSTRAINT_LANGUAGE[constraint];
  const premise = brief || "Add a concrete brief to create a reviewable scope memo.";

  return {
    premise,
    firstSlice: deliveryLanguage.firstSlice,
    nonGoal: deliveryLanguage.nonGoal,
    risk: constraintLanguage.risk,
    review: constraintLanguage.review,
    nextDecision: deliveryLanguage.nextDecision,
    markdown: `# First-slice scope memo\n\n## Working premise\n${premise}\n\n## First slice\n${deliveryLanguage.firstSlice}\n\n## Keep out of this round\n${deliveryLanguage.nonGoal}\n\n## Risk to make visible\n${constraintLanguage.risk}\n\n## Review contract\n${constraintLanguage.review}\n\n## Decision before build\n${deliveryLanguage.nextDecision}\n`,
  };
}
