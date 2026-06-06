"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Gauge,
  ListChecks,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StepId = "goal" | "audience" | "inputs" | "handoff";

type Choice = {
  id: string;
  label: string;
  detail: string;
  score: number;
};

type Step = {
  id: StepId;
  title: string;
  prompt: string;
  choices: Choice[];
};

const STEPS: Step[] = [
  {
    id: "goal",
    title: "Goal",
    prompt: "What should the flow optimize for?",
    choices: [
      {
        id: "lead",
        label: "Qualified leads",
        detail: "Route high-intent users into a short sales handoff.",
        score: 2,
      },
      {
        id: "self-serve",
        label: "Self-serve signup",
        detail: "Help users reach the right plan without a call.",
        score: 3,
      },
      {
        id: "internal",
        label: "Internal intake",
        detail: "Collect structured requests from teams or operators.",
        score: 1,
      },
    ],
  },
  {
    id: "audience",
    title: "Audience",
    prompt: "Who is moving through it most often?",
    choices: [
      {
        id: "founder",
        label: "Founder / buyer",
        detail: "Low patience, high context, wants an answer quickly.",
        score: 2,
      },
      {
        id: "consumer",
        label: "Consumer user",
        detail: "Needs guided decisions, progress cues, and low friction.",
        score: 3,
      },
      {
        id: "operator",
        label: "Ops teammate",
        detail: "Repeat use, keyboard-friendly inputs, editable records.",
        score: 1,
      },
    ],
  },
  {
    id: "inputs",
    title: "Inputs",
    prompt: "What kind of data does the flow need?",
    choices: [
      {
        id: "simple",
        label: "5-8 questions",
        detail: "Radio groups, checkboxes, short text, and validation.",
        score: 1,
      },
      {
        id: "branching",
        label: "Branching quiz",
        detail: "Conditional steps, scoring, and personalized results.",
        score: 3,
      },
      {
        id: "uploads",
        label: "Files + review",
        detail: "Uploads, extraction, manual edits, and confirmation.",
        score: 4,
      },
    ],
  },
  {
    id: "handoff",
    title: "Handoff",
    prompt: "Where should the result go?",
    choices: [
      {
        id: "email",
        label: "Email summary",
        detail: "Send a clean recap to user and team.",
        score: 1,
      },
      {
        id: "crm",
        label: "CRM / workspace",
        detail: "Push structured data to HubSpot, Airtable, Notion, or Linear.",
        score: 3,
      },
      {
        id: "account",
        label: "In-app account",
        detail: "Persist progress, answers, and next steps behind auth.",
        score: 4,
      },
    ],
  },
];

const EXAMPLES = [
  "plan finder",
  "lead qualifier",
  "onboarding wizard",
  "quote builder",
];

export function ReactFlowDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<StepId, string>>({
    goal: "lead",
    audience: "founder",
    inputs: "branching",
    handoff: "crm",
  });

  const current = STEPS[activeStep];
  const selected = useMemo(
    () =>
      STEPS.map((step) => ({
        step,
        choice: step.choices.find((choice) => choice.id === answers[step.id]),
      })),
    [answers],
  );

  const totalScore = selected.reduce((sum, item) => sum + (item.choice?.score ?? 0), 0);
  const completed = selected.filter((item) => item.choice).length;
  const completion = Math.round((completed / STEPS.length) * 100);
  const isLast = activeStep === STEPS.length - 1;

  const recommendation = useMemo(() => {
    if (totalScore <= 6) {
      return {
        label: "Lean flow",
        timeline: "1-2 weeks",
        scope: "single-path form, validation, email handoff",
      };
    }
    if (totalScore <= 10) {
      return {
        label: "Productized quiz",
        timeline: "2-4 weeks",
        scope: "branching steps, scoring, analytics, CRM handoff",
      };
    }
    return {
      label: "Workflow app",
      timeline: "4-6 weeks",
      scope: "auth, saved progress, uploads, admin review, integrations",
    };
  }, [totalScore]);

  function select(choiceId: string) {
    setAnswers((next) => ({ ...next, [current.id]: choiceId }));
  }

  function reset() {
    setActiveStep(0);
    setAnswers({
      goal: "lead",
      audience: "founder",
      inputs: "branching",
      handoff: "crm",
    });
  }

  return (
    <div className="overflow-hidden rounded-md border border-line-soft bg-bg-2/35">
      <div className="grid min-w-0 gap-px bg-line-soft lg:grid-cols-[220px_minmax(0,1fr)_340px]">
        <aside className="min-w-0 bg-bg p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <HeaderLabel icon={<ClipboardList className="size-3" />} label="flow demo" />
            <span className="rounded-full border border-line bg-bg-2 px-2 py-0.5 font-mono text-[10px] lowercase tracking-[0.04em] text-fg-dim">
              {completion}%
            </span>
          </div>

          <ol className="min-w-0 space-y-2">
            {STEPS.map((step, index) => {
              const isActive = index === activeStep;
              const hasAnswer = Boolean(answers[step.id]);

              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition",
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-fg"
                        : "border-line-soft bg-bg-2/25 text-fg-muted hover:border-line hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded border font-mono text-[10px]",
                        isActive
                          ? "border-[var(--accent)] text-[var(--accent)]"
                          : "border-line text-fg-dim",
                      )}
                    >
                      {hasAnswer ? <Check className="size-3" /> : `0${index + 1}`}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-medium">{step.title}</span>
                      <span className="block truncate font-mono text-[10px] lowercase text-fg-dim">
                        {selected[index]?.choice?.label ?? "choose"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex min-w-0 flex-wrap gap-1.5">
            {EXAMPLES.map((example) => (
              <span
                key={example}
                className="rounded-full border border-line-soft bg-bg-2/35 px-2 py-0.5 font-mono text-[10px] lowercase text-fg-dim"
              >
                {example}
              </span>
            ))}
          </div>
        </aside>

        <section className="min-w-0 bg-bg p-4 sm:p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <HeaderLabel icon={<ListChecks className="size-3" />} label={`step 0${activeStep + 1}`} />
              <h3 className="mt-2 font-sans text-[24px] font-medium tracking-[-0.01em] text-fg sm:text-[30px]">
                {current.prompt}
              </h3>
            </div>
            <div className="rounded-md border border-line-soft bg-bg-2/35 px-3 py-2 font-mono text-[10px] lowercase text-fg-dim">
              score <span className="text-fg">{totalScore}</span> / 14
            </div>
          </div>

          <div className="grid gap-2">
            {current.choices.map((choice) => {
              const checked = answers[current.id] === choice.id;

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => select(choice.id)}
                  className={cn(
                    "group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-md border px-4 py-3 text-left transition",
                    checked
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-line-soft bg-bg-2/25 hover:border-line hover:bg-bg-2/40",
                  )}
                >
                  <span>
                    <span className="block min-w-0 break-words text-[14px] font-medium text-fg">
                      {choice.label}
                    </span>
                    <span className="mt-1 block max-w-[58ch] text-[12px] leading-relaxed text-fg-muted">
                      {choice.detail}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border",
                      checked
                        ? "border-[var(--accent)] bg-[var(--accent)] text-bg"
                        : "border-line text-transparent group-hover:text-fg-dim",
                    )}
                    aria-hidden="true"
                  >
                    <Check className="size-3.5" />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
              disabled={activeStep === 0}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-line-soft px-3 font-mono text-[11px] lowercase text-fg-muted transition hover:border-line hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="size-3.5" />
              back
            </button>

            <div className="h-1.5 min-w-[140px] flex-1 overflow-hidden rounded-full bg-bg-2 sm:max-w-[240px]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width]"
                style={{ width: `${completion}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => (isLast ? reset() : setActiveStep((step) => Math.min(STEPS.length - 1, step + 1)))}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent)] px-3 font-mono text-[11px] lowercase text-bg transition hover:brightness-110"
            >
              {isLast ? (
                <>
                  <RotateCcw className="size-3.5" />
                  reset
                </>
              ) : (
                <>
                  next
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </section>

        <aside className="min-w-0 bg-bg p-4">
          <HeaderLabel icon={<Gauge className="size-3" />} label="live result" />

          <div className="mt-4 rounded-md border border-line-soft bg-bg-2/35 p-4">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <Sparkles className="size-4" />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                {recommendation.label}
              </span>
            </div>
            <div className="mt-3 font-sans text-[28px] font-medium tracking-[-0.01em] text-fg">
              {recommendation.timeline}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">{recommendation.scope}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="state" value={`${completed}/${STEPS.length} steps`} />
            <Metric label="handoff" value={answers.handoff} />
          </div>

          <div className="mt-4 rounded-md border border-line-soft bg-bg-2/20 p-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
              generated summary
            </div>
            <p className="m-0 text-[12px] leading-relaxed text-fg-muted">
              Build a{" "}
              <span className="text-fg">{selected[2]?.choice?.label.toLowerCase()}</span> for{" "}
              <span className="text-fg">{selected[1]?.choice?.label.toLowerCase()}</span>, optimized
              for <span className="text-fg">{selected[0]?.choice?.label.toLowerCase()}</span>, with a{" "}
              <span className="text-fg">{selected[3]?.choice?.label.toLowerCase()}</span> handoff.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HeaderLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
      <span className="text-[var(--accent)]">{icon}</span>
      {label}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line-soft bg-bg-2/25 px-3 py-2">
      <div className="font-mono text-[10px] lowercase text-fg-dim">{label}</div>
      <div className="truncate text-[12px] text-fg-muted">{value}</div>
    </div>
  );
}
