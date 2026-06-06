"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Blocks,
  Check,
  ClipboardList,
  Layers3,
  Radar,
  Rocket,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type StepId = "product" | "audience" | "complexity" | "integrations" | "polish";

type Choice = {
  id: string;
  label: string;
  detail: string;
  weight: number;
};

type Step = {
  id: StepId;
  eyebrow: string;
  title: string;
  prompt: string;
  icon: ReactNode;
  choices: Choice[];
};

const STEPS: Step[] = [
  {
    id: "product",
    eyebrow: "product shape",
    title: "Start with the messy idea",
    prompt: "What are we turning into a product surface?",
    icon: <Rocket className="size-4" />,
    choices: [
      { id: "saas", label: "B2B SaaS", detail: "A customer-facing product with onboarding, plans, and workflow depth.", weight: 3 },
      { id: "internal", label: "Internal tool", detail: "A dense operator surface for repeat use and high signal-to-noise.", weight: 2 },
      { id: "ai", label: "AI workflow", detail: "Prompting, model routing, generation states, and human review loops.", weight: 4 },
      { id: "market", label: "Marketplace", detail: "Trust-heavy flow with matching, pricing, and conversion pressure.", weight: 3 },
    ],
  },
  {
    id: "audience",
    eyebrow: "primary user",
    title: "Design for the impatient evaluator",
    prompt: "Who needs to understand value fastest?",
    icon: <Radar className="size-4" />,
    choices: [
      { id: "founder", label: "Founder / buyer", detail: "Needs clarity, speed, and a credible path to revenue.", weight: 3 },
      { id: "operator", label: "Ops teammate", detail: "Needs dense controls, saved state, keyboardable repetition.", weight: 4 },
      { id: "consumer", label: "Consumer user", detail: "Needs emotional polish, guidance, and low-friction completion.", weight: 2 },
      { id: "enterprise", label: "Enterprise team", detail: "Needs permissions, auditability, trust, and integration hooks.", weight: 4 },
    ],
  },
  {
    id: "complexity",
    eyebrow: "interaction model",
    title: "Make the flow prove frontend depth",
    prompt: "What kind of interaction earns the demo?",
    icon: <Workflow className="size-4" />,
    choices: [
      { id: "onboarding", label: "Guided onboarding", detail: "Multi-step state, validation, progress, and readable handoff.", weight: 2 },
      { id: "branching", label: "Branching wizard", detail: "Conditional steps, scoring, recommendation logic, and summary state.", weight: 4 },
      { id: "uploads", label: "Upload + review", detail: "Extraction, manual correction, confidence states, and confirmation.", weight: 5 },
      { id: "dashboard", label: "Dashboard handoff", detail: "Charts, tables, drilldowns, risk panels, and action previews.", weight: 5 },
    ],
  },
  {
    id: "integrations",
    eyebrow: "handoff path",
    title: "Show that the interface lands somewhere real",
    prompt: "Where should the productized output go?",
    icon: <Blocks className="size-4" />,
    choices: [
      { id: "crm", label: "CRM / sales", detail: "Qualified lead, score, notes, and next-action routing.", weight: 2 },
      { id: "linear", label: "Linear / roadmap", detail: "Epics, issues, acceptance criteria, and implementation sequencing.", weight: 4 },
      { id: "analytics", label: "Analytics loop", detail: "Events, funnel health, drop-off, and experiment decisions.", weight: 3 },
      { id: "auth", label: "Account workspace", detail: "Saved progress, user state, permissions, and long-running tasks.", weight: 5 },
    ],
  },
  {
    id: "polish",
    eyebrow: "finish level",
    title: "Decide how hard the surface should hit",
    prompt: "What does the final artifact need to feel like?",
    icon: <Sparkles className="size-4" />,
    choices: [
      { id: "prototype", label: "Clickable prototype", detail: "Fast, clear, and scoped to validate the interaction model.", weight: 1 },
      { id: "product", label: "Product-grade", detail: "Responsive, accessible, polished, and ready for real users.", weight: 4 },
      { id: "investor", label: "Investor demo", detail: "Cinematic reveal, narrative clarity, and a memorable proof moment.", weight: 5 },
      { id: "production", label: "Production-ready", detail: "Instrumentation, errors, loading, empty states, and maintainable code.", weight: 5 },
    ],
  },
];

const DEFAULTS: Record<StepId, string> = {
  product: "ai",
  audience: "operator",
  complexity: "branching",
  integrations: "linear",
  polish: "investor",
};

export function ProductLaunchSimulator() {
  const [active, setActive] = useState(0);
  const [answers, setAnswers] = useState<Record<StepId, string>>(DEFAULTS);
  const current = STEPS[active];

  const selected = useMemo(
    () =>
      STEPS.map((step) => ({
        step,
        choice: step.choices.find((choice) => choice.id === answers[step.id]) ?? step.choices[0],
      })),
    [answers],
  );

  const score = selected.reduce((sum, item) => sum + item.choice.weight, 0);
  const completion = Math.round(((active + 1) / STEPS.length) * 100);
  const build = useMemo(() => getBuildShape(score, answers), [score, answers]);

  function choose(choiceId: string) {
    setAnswers((next) => ({ ...next, [current.id]: choiceId }));
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line-soft bg-[oklch(0.115_0.006_250)] shadow-[0_40px_160px_rgba(0,0,0,0.45)]">
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(900px_420px_at_18%_0%,color-mix(in_oklab,var(--accent)_26%,transparent),transparent_62%),radial-gradient(700px_420px_at_92%_18%,color-mix(in_oklab,var(--accent-2)_18%,transparent),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]"
      />
      <div aria-hidden className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative grid gap-px bg-line-soft/70 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="bg-bg/88 p-5 backdrop-blur xl:sticky xl:top-20 xl:min-h-[720px]">
          <Header icon={<Zap className="size-4" />} label="product launch simulator" value={`${completion}%`} />
          <p className="mt-4 text-[13px] leading-relaxed text-fg-muted">
            Turn a fuzzy product idea into a recruiter-readable build packet: flow, UI states,
            risk, timeline, and handoff.
          </p>

          <ol className="mt-8 space-y-2">
            {STEPS.map((step, index) => {
              const isActive = index === active;
              const isDone = index < active;
              const item = selected[index];
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    className={cn(
                      "group grid w-full grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-2xl border p-3 text-left transition",
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent)]/12 text-fg shadow-[0_0_40px_color-mix(in_oklab,var(--accent)_18%,transparent)]"
                        : "border-line-soft bg-bg-2/20 text-fg-muted hover:border-line hover:bg-bg-2/40 hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-xl border",
                        isActive || isDone
                          ? "border-[var(--accent)] text-[var(--accent)]"
                          : "border-line text-fg-dim",
                      )}
                    >
                      {isDone ? <Check className="size-4" /> : step.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
                        0{index + 1} · {step.eyebrow}
                      </span>
                      <span className="mt-1 block truncate text-[13px] font-medium">{step.title}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-fg-dim">
                        {item.choice.label}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <main className="min-w-0 bg-bg/72 p-4 backdrop-blur sm:p-6 xl:min-h-[720px]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[720px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-bg-2/45 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
                <span className="text-[var(--accent)]">0{active + 1}</span>
                {current.eyebrow}
              </div>
              <h3 className="mt-4 max-w-[680px] font-sans text-[clamp(28px,5vw,56px)] font-medium leading-[0.95] tracking-[-0.045em] text-fg">
                {current.prompt}
              </h3>
            </div>
            <div className="rounded-2xl border border-line-soft bg-bg-2/35 px-4 py-3 font-mono text-[10px] lowercase text-fg-dim">
              complexity <span className="text-fg">{score}</span> / 23
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {current.choices.map((choice) => {
              const checked = answers[current.id] === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => choose(choice.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-300",
                    checked
                      ? "border-[var(--accent)] bg-[var(--accent)]/12 shadow-[0_0_50px_color-mix(in_oklab,var(--accent)_16%,transparent)]"
                      : "border-line-soft bg-bg-2/24 hover:border-line hover:bg-bg-2/42",
                  )}
                >
                  <span className="relative z-10 flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-[15px] font-medium text-fg">{choice.label}</span>
                      <span className="mt-2 block max-w-[44ch] text-[12px] leading-relaxed text-fg-muted">
                        {choice.detail}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full border transition",
                        checked
                          ? "border-[var(--accent)] bg-[var(--accent)] text-bg"
                          : "border-line text-transparent group-hover:text-fg-dim",
                      )}
                    >
                      <Check className="size-4" />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-line-soft bg-[oklch(0.13_0.006_250)]">
            <LivePreview active={active} selected={selected} build={build} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="h-1.5 min-w-[180px] flex-1 overflow-hidden rounded-full bg-bg-2">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                animate={{ width: `${completion}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 24 }}
              />
            </div>
            <button
              type="button"
              onClick={() => setActive((next) => (next + 1) % STEPS.length)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 font-mono text-[11px] lowercase tracking-[0.06em] text-bg transition hover:brightness-110"
            >
              {active === STEPS.length - 1 ? "replay" : "next layer"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </main>

        <aside className="bg-bg/88 p-5 backdrop-blur xl:sticky xl:top-20 xl:min-h-[720px]">
          <Header icon={<ClipboardList className="size-4" />} label="generated handoff" value="live" />

          <div className="mt-5 rounded-3xl border border-line-soft bg-bg-2/35 p-5">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <Sparkles className="size-4" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{build.label}</span>
            </div>
            <div className="mt-3 font-sans text-[32px] font-medium tracking-[-0.04em] text-fg">
              {build.timeline}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">{build.summary}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metric label="surface" value={selected[0].choice.label} />
            <Metric label="user" value={selected[1].choice.label} />
            <Metric label="flow" value={selected[2].choice.label} />
            <Metric label="handoff" value={selected[3].choice.label} />
          </div>

          <div className="mt-4 rounded-3xl border border-line-soft bg-bg-2/24 p-4">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              build packet
            </div>
            <ul className="space-y-3">
              {build.packet.map((item, index) => (
                <li key={item} className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 text-[12px] leading-relaxed text-fg-muted">
                  <span className="flex size-6 items-center justify-center rounded-full border border-line-soft font-mono text-[10px] text-[var(--accent)]">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LivePreview({
  active,
  selected,
  build,
}: {
  active: number;
  selected: Array<{ step: Step; choice: Choice }>;
  build: ReturnType<typeof getBuildShape>;
}) {
  const visible = active + 1;
  return (
    <div className="relative min-h-[360px] p-4 sm:p-5">
      <div aria-hidden className="absolute inset-0 [background:radial-gradient(500px_260px_at_50%_0%,rgba(255,255,255,.08),transparent_62%)]" />
      <div className="relative mx-auto max-w-[780px] rounded-[22px] border border-white/10 bg-black/28 p-3 shadow-2xl backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-amber-300/70" />
            <span className="size-2.5 rounded-full bg-emerald-300/70" />
          </div>
          <div className="font-mono text-[10px] lowercase tracking-[0.1em] text-white/45">launch-room.app / handoff</div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <PreviewPanel show={visible >= 1} title="Product brief" icon={<Layers3 className="size-4" />}>
              <div className="text-[13px] leading-relaxed text-white/72">
                Build a <span className="text-white">{selected[0].choice.label}</span> for {" "}
                <span className="text-white">{selected[1].choice.label.toLowerCase()}</span> with a clear first win.
              </div>
            </PreviewPanel>

            <PreviewPanel show={visible >= 2} title="Interface preview" icon={<Workflow className="size-4" />}>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Intake", selected[2].choice.label, "Result"].map((label, index) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">0{index + 1}</div>
                    <div className="text-[12px] font-medium text-white/80">{label}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-[var(--accent)]"
                        initial={false}
                        animate={{ width: `${42 + index * 22}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </PreviewPanel>

            <PreviewPanel show={visible >= 3} title="Risk radar" icon={<Radar className="size-4" />}>
              <div className="grid gap-2 sm:grid-cols-3">
                {build.risks.map((risk) => (
                  <div key={risk} className="rounded-xl border border-amber-300/15 bg-amber-300/8 px-3 py-2 text-[11px] text-amber-100/80">
                    {risk}
                  </div>
                ))}
              </div>
            </PreviewPanel>
          </div>

          <PreviewPanel show={visible >= 4} title="Ship plan" icon={<ClipboardList className="size-4" />} className="h-full">
            <div className="space-y-3">
              {build.packet.slice(0, 4).map((line, index) => (
                <div key={line} className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--accent)]">week {index + 1}</div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/62">{line}</p>
                </div>
              ))}
            </div>
          </PreviewPanel>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({
  show,
  title,
  icon,
  children,
  className,
}: {
  show: boolean;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={false}
      animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0.28, y: 14, filter: "blur(1.5px)" }}
      transition={{ type: "spring", stiffness: 120, damping: 22 }}
      className={cn("rounded-2xl border border-white/10 bg-white/[0.055] p-3", className)}
    >
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/42">
        <span className="text-[var(--accent)]">{icon}</span>
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function Header({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
      <span className="inline-flex items-center gap-2">
        <span className="text-[var(--accent)]">{icon}</span>
        {label}
      </span>
      <span className="rounded-full border border-line bg-bg-2 px-2.5 py-1 lowercase tracking-[0.06em]">
        {value}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line-soft bg-bg-2/24 p-3">
      <div className="font-mono text-[10px] lowercase text-fg-dim">{label}</div>
      <div className="mt-1 truncate text-[12px] text-fg-muted">{value}</div>
    </div>
  );
}

function getBuildShape(score: number, answers: Record<StepId, string>) {
  const highPolish = answers.polish === "investor" || answers.polish === "production";
  const label = score >= 19 ? "full product system" : score >= 15 ? "productized vertical slice" : "focused launch flow";
  const timeline = score >= 19 ? "5–7 weeks" : score >= 15 ? "3–5 weeks" : "2–3 weeks";
  const summary = highPolish
    ? "Cinematic enough to sell the idea, structured enough to hand to engineering without translation loss."
    : "A tight build that validates the core interaction before the surface expands."

  return {
    label,
    timeline,
    summary,
    risks: [
      answers.complexity === "uploads" ? "uncertain extraction quality" : "branching-state drift",
      answers.integrations === "auth" ? "permission model scope" : "handoff data shape",
      highPolish ? "motion/performance budget" : "prototype fidelity gap",
    ],
    packet: [
      "Map the first-run flow, empty states, success states, and the decision points that change the route.",
      "Build the interactive shell with typed state, validation, progressive summary, and responsive fallbacks.",
      "Add the proof surface: live preview, risk radar, generated handoff, and evaluator-facing copy.",
      "Instrument the handoff path and define the acceptance criteria for the next production slice.",
    ],
  };
}
