"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Bot,
  GitBranch,
  ListChecks,
  MousePointer2,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TimelineEditor } from "@/components/lab/timeline-editor";
import { PromptCompilerArtifact } from "@/components/prompt-compiler-artifact";
import { AiChat } from "@/components/lab/ai-chat";
import { ReactFlowDemo } from "@/components/lab/react-flow-demo";
import { AssumptionLedger } from "@/components/lab/assumption-ledger";

type Experiment = {
  id: string;
  title: string;
  kicker: string;
  value: string;
  icon: ReactNode;
  component: ReactNode;
};

const EXPERIMENTS: Experiment[] = [
  {
    id: "ledger",
    title: "Assumption Ledger",
    kicker: "hypothesis · signal · falsifier",
    value:
      "Turn a product claim into a small, reviewable experiment with a first action, success signal, and condition to reverse course.",
    icon: <ListChecks className="size-4" />,
    component: <AssumptionLedger />,
  },
  {
    id: "timeline",
    title: "Timeline Editor",
    kicker: "canvas · drag · trim · playback",
    value:
      "A compact editor surface: draggable clips, trim handles, playhead scrubbing, preview state, and keyboard nudge controls.",
    icon: <Scissors className="size-4" />,
    component: <TimelineEditor />,
  },
  {
    id: "prompt",
    title: "Prompt Compiler",
    kicker: "graph state · prompt routing",
    value:
      "A small artifact from image-generation tooling: selected graph nodes compile into prompt text, model params, and a run plan.",
    icon: <GitBranch className="size-4" />,
    component: <PromptCompilerArtifact />,
  },
  {
    id: "ai-chat",
    title: "AI Chat Surface",
    kicker: "streaming · provider-agnostic",
    value:
      "A provider-agnostic chat UI wired through a server proxy so model keys never touch the browser.",
    icon: <Bot className="size-4" />,
    component: <AiChat />,
  },
  {
    id: "flow",
    title: "Flow Wizard",
    kicker: "forms · scoring · handoff",
    value:
      "The smaller wizard prototype: branching choices, scoring, recommendation logic, and generated summary state.",
    icon: <MousePointer2 className="size-4" />,
    component: <ReactFlowDemo />,
  },
];

export function ExperimentGallery() {
  const [activeId, setActiveId] = useState(EXPERIMENTS[0]?.id ?? "");
  const active = useMemo(
    () =>
      EXPERIMENTS.find((experiment) => experiment.id === activeId) ??
      EXPERIMENTS[0],
    [activeId],
  );

  if (!active) return null;

  return (
    <div className="overflow-hidden rounded-[24px] border border-line-soft bg-bg-2/25">
      <div className="grid gap-px bg-line-soft lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="bg-bg p-4 sm:p-5">
          <div className="mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              experiment gallery
            </div>
            <p className="mt-2 max-w-[46ch] text-[12px] leading-relaxed text-fg-muted">
              Smaller interaction studies live here one at a time, so they
              don&apos;t fight the main simulator or each other.
            </p>
          </div>

          <div
            className="grid gap-2"
            role="tablist"
            aria-label="Lab experiments"
          >
            {EXPERIMENTS.map((experiment) => {
              const isActive = experiment.id === active.id;
              return (
                <button
                  key={experiment.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`experiment-panel-${experiment.id}`}
                  id={`experiment-tab-${experiment.id}`}
                  onClick={() => setActiveId(experiment.id)}
                  className={cn(
                    "group grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-2xl border p-3 text-left transition",
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-fg"
                      : "border-line-soft bg-bg-2/20 text-fg-muted hover:border-line hover:bg-bg-2/40 hover:text-fg",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-xl border",
                      isActive
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-line text-fg-dim",
                    )}
                  >
                    {experiment.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">
                      {experiment.title}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] lowercase text-fg-dim">
                      {experiment.kicker}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section
          key={active.id}
          id={`experiment-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`experiment-tab-${active.id}`}
          className="min-w-0 bg-bg p-4 sm:p-5"
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
                <span className="text-[var(--accent)]">{active.icon}</span>
                {active.kicker}
              </div>
              <h3 className="mt-2 font-sans text-[28px] font-medium tracking-[-0.025em] text-fg">
                {active.title}
              </h3>
            </div>
            <p className="max-w-[46ch] text-[12px] leading-relaxed text-fg-muted">
              {active.value}
            </p>
          </div>

          <div className="min-w-0">{active.component}</div>
        </section>
      </div>
    </div>
  );
}
