"use client";

import { useState } from "react";
import { ExternalLink, Route, Search, TriangleAlert, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const REPLAY_URL = "https://signalops.cc/cockpit?replay=alibaba-p95&step=0";

type ReplayStep = {
  label: string;
  title: string;
  description: string;
  state: string;
  Icon: LucideIcon;
};

const REPLAY_STEPS: ReplayStep[] = [
  {
    label: "incident",
    title: "Alibaba p95 spike",
    description:
      "The replay selects the Qwen provider alert and opens the incident context that started the investigation.",
    state: "scenario: alibaba-p95 · provider: Alibaba",
    Icon: TriangleAlert,
  },
  {
    label: "triage",
    title: "Scope affected jobs",
    description:
      "The same script switches to provider triage and filters the virtualized generation queue to the impacted jobs.",
    state: "saved view: provider triage · queue filter: Alibaba",
    Icon: Search,
  },
  {
    label: "routing",
    title: "Draft the decision",
    description:
      "The rule builder stages a traffic drain and recomputes its projected impact before the operator applies or exports it.",
    state: "routing draft · impact preview · export handoff",
    Icon: Route,
  },
];

export function SignalOpsReplayDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const reduceMotion = useReducedMotion();
  const step = REPLAY_STEPS[activeStep];

  return (
    <section
      aria-label="SignalOps guided incident replay preview"
      className="my-8 overflow-hidden rounded-md border border-line-soft bg-bg-2/60"
    >
      <div className="border-b border-line-soft px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="!mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">
              Guided replay · Alibaba p95
            </p>
            <h3 className="!m-0 font-sans text-[18px] font-medium tracking-[-0.01em] text-fg sm:text-[20px]">
              Incident → triage → routing decision
            </h3>
          </div>
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-fg-dim">
            scripted product flow
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-line-soft" aria-label="Replay stages">
        {REPLAY_STEPS.map(({ label, Icon }, index) => {
          const selected = index === activeStep;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveStep(index)}
              className={`group relative flex min-w-0 items-center justify-center gap-1.5 border-r border-line-soft px-2 py-3 font-mono text-[10px] uppercase tracking-[0.08em] outline-none transition-colors last:border-r-0 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] sm:gap-2 sm:px-3 sm:text-[11px] ${
                selected ? "bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] text-fg" : "text-fg-dim hover:text-fg"
              }`}
            >
              <Icon
                aria-hidden="true"
                className={`size-3.5 shrink-0 ${selected ? "text-[var(--accent)]" : "text-fg-dim"}`}
                strokeWidth={1.7}
              />
              <span className="truncate">{label}</span>
              {selected && (
                <motion.span
                  layoutId="signalops-replay-active"
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px bg-[var(--accent)]"
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5">
        <div className="min-w-0" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.label}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
            >
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
                <span className="text-[var(--accent)]">0{activeStep + 1}</span>
                <span aria-hidden="true">/</span>
                <span>dashboard state</span>
              </div>
              <h4 className="m-0 mb-2 font-sans text-[21px] font-medium tracking-[-0.015em] text-fg">
                {step.title}
              </h4>
              <p className="!mb-3 max-w-[58ch] text-[13px] leading-[1.65] text-fg-muted">
                {step.description}
              </p>
              <p className="!m-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-sm border border-line-soft bg-bg/50 px-2.5 py-2 font-mono text-[10px] text-fg-dim">
                {step.state}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <a
          href={REPLAY_URL}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[color-mix(in_oklab,var(--accent)_44%,var(--line))] bg-[color-mix(in_oklab,var(--accent)_10%,var(--bg))] px-3.5 py-2.5 font-mono text-[11px] text-fg outline-none transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Open live replay
          <ExternalLink
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.7}
          />
        </a>
      </div>
    </section>
  );
}
