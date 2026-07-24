"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
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
import { motion, useReducedMotion } from "motion/react";
import {
  getLaunchBlueprintCaseStudy,
  getLaunchBlueprintHistoryPath,
  getLaunchBlueprintPath,
  type LaunchBlueprintCaseStudy,
  type LaunchBlueprint,
  type LaunchBlueprintStep,
} from "@/lib/product-launch-blueprint";
import { cn } from "@/lib/utils";

type StepId = LaunchBlueprintStep;

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

export function ProductLaunchSimulator({ initialBlueprint }: { initialBlueprint: LaunchBlueprint }) {
  const [active, setActive] = useState(() => STEPS.findIndex((step) => step.id === initialBlueprint.active));
  const [answers, setAnswers] = useState<Record<StepId, string>>(initialBlueprint.answers);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const copyVersion = useRef(0);
  const reduceMotion = useReducedMotion();
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
  const caseStudy = useMemo(() => getLaunchBlueprintCaseStudy(answers), [answers]);

  useEffect(() => {
    const path = getLaunchBlueprintHistoryPath(
      { active: current.id, answers },
      window.location.search,
      window.location.hash,
    );
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        window.history.replaceState(null, "", path);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [answers, current.id]);

  function invalidateCopiedBlueprint() {
    copyVersion.current += 1;
    setCopyStatus("idle");
  }

  function selectStep(index: number) {
    invalidateCopiedBlueprint();
    setActive(index);
  }

  function choose(choiceId: string) {
    invalidateCopiedBlueprint();
    setAnswers((next) => ({ ...next, [current.id]: choiceId }));
  }

  function advanceStep() {
    invalidateCopiedBlueprint();
    setActive((next) => (next + 1) % STEPS.length);
  }

  async function copyBlueprintLink() {
    const version = ++copyVersion.current;
    const href = new URL(
      getLaunchBlueprintPath({ active: current.id, answers }),
      window.location.origin,
    ).toString();

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(href);

      if (copyVersion.current === version) {
        setCopyStatus("copied");
      }
    } catch {
      if (copyVersion.current === version) {
        setCopyStatus("error");
      }
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-line-soft/70 bg-bg/35">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 [background:radial-gradient(900px_420px_at_18%_0%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent)]"
      />

      <div className="relative grid xl:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="border-b border-line-soft/70 bg-bg/55 p-4 backdrop-blur xl:sticky xl:top-20 xl:border-b-0 xl:border-r xl:min-h-[560px]">
          <Header icon={<Zap className="size-4" />} label="product launch simulator" value={`${completion}%`} />
          <p className="mt-4 text-[13px] leading-relaxed text-fg-muted">
            Pick the constraints, then watch the fuzzy idea compile into a concrete launch blueprint:
            preview, risks, timeline, and build packet.
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
                    onClick={() => selectStep(index)}
                    className={cn(
                      "group grid w-full grid-cols-[26px_minmax(0,1fr)] gap-3 border-l px-2 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent)]/[0.035] text-fg"
                        : "border-line-soft/60 text-fg-muted hover:border-line hover:bg-bg-2/20 hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 items-center justify-center font-mono text-[10px] transition",
                        isActive || isDone ? "text-[var(--accent)]" : "text-fg-dim",
                      )}
                    >
                      {isDone ? <Check className="size-3.5" /> : `0${index + 1}`}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
                        {step.eyebrow}
                      </span>
                      <span className="mt-1 block text-[13px] font-medium leading-snug">{step.title}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-fg-dim">
                        {item.choice.label}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="min-w-0 bg-bg/35 p-4 backdrop-blur sm:p-5 xl:min-h-[560px]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[780px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-bg-2/45 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
                <span className="text-[var(--accent)]">0{active + 1}</span>
                {current.eyebrow}
              </div>
              <h3 className="mt-4 max-w-[760px] font-sans text-[clamp(28px,5vw,56px)] font-medium leading-[0.95] tracking-[-0.045em] text-fg">
                Tune the launch brief. The blueprint updates live.
              </h3>
              <p
                id={`product-launch-choice-label-${current.id}`}
                className="mt-3 max-w-[620px] text-[14px] leading-relaxed text-fg-muted"
              >
                {current.prompt}
              </p>
            </div>
            <div className="rounded-full border border-line-soft bg-bg-2/25 px-3 py-2 font-mono text-[10px] lowercase text-fg-dim">
              complexity <span className="text-fg">{score}</span> / 23
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
            <span>configure this step</span>
            <span>choose one</span>
          </div>

          <div
            role="group"
            aria-labelledby={`product-launch-choice-label-${current.id}`}
            className="overflow-hidden rounded-2xl border border-line-soft bg-bg-2/16"
          >
            {current.choices.map((choice) => {
              const checked = answers[current.id] === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => choose(choice.id)}
                  className={cn(
                    "group relative w-full border-t border-line-soft/70 px-4 py-3 text-left transition first:border-t-0 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]",
                    checked
                      ? "bg-[var(--accent)]/[0.035] shadow-[inset_3px_0_0_var(--accent)]"
                      : "hover:bg-bg-2/32",
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
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[var(--accent)] transition",
                        checked ? "opacity-100" : "opacity-0 group-hover:opacity-35",
                      )}
                    >
                      <Check className="size-4" />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 h-1 min-w-[180px] overflow-hidden rounded-full bg-bg-2/60">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
              animate={{ width: `${completion}%` }}
              transition={
                reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 24 }
              }
            />
          </div>

          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={advanceStep}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 font-mono text-[12px] lowercase tracking-[0.06em] text-bg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {active === STEPS.length - 1 ? "replay simulator" : "next step"}
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mt-4 border-t border-line-soft/70 pt-4">
            <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              <span>live preview</span>
              <span>updates from the selections above</span>
            </div>
            <LivePreview active={active} selected={selected} build={build} />
          </div>

          <HandoffPanel
            selected={selected}
            build={build}
            caseStudy={caseStudy}
            copyStatus={copyStatus}
            onCopyBlueprint={copyBlueprintLink}
          />

        </div>

      </div>
    </div>
  );
}

function HandoffPanel({
  selected,
  build,
  caseStudy,
  copyStatus,
  onCopyBlueprint,
}: {
  selected: Array<{ step: Step; choice: Choice }>;
  build: ReturnType<typeof getBuildShape>;
  caseStudy: LaunchBlueprintCaseStudy;
  copyStatus: "idle" | "copied" | "error";
  onCopyBlueprint: () => void;
}) {
  return (
    <section className="mt-4 border-t border-line-soft/70 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Header icon={<ClipboardList className="size-4" />} label="draft blueprint" value="live draft" />
        <button
          type="button"
          onClick={onCopyBlueprint}
          aria-describedby="product-launch-copy-status"
          className="inline-flex h-9 items-center rounded-full border border-line-soft bg-bg-2/30 px-3 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-muted transition hover:border-[var(--accent)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          Copy blueprint link
        </button>
      </div>
      <p
        id="product-launch-copy-status"
        aria-live="polite"
        className="mt-2 min-h-5 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim"
      >
        {copyStatus === "copied"
          ? "Blueprint link copied."
          : copyStatus === "error"
            ? "Could not copy the link. Please copy it from the address bar."
            : null}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.4fr)]">
        <div className="p-1">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <Sparkles className="size-4" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{build.label}</span>
          </div>
          <div className="mt-3 font-sans text-[34px] font-medium tracking-[-0.04em] text-fg">
            {build.timeline}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{build.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metric label="surface" value={selected[0].choice.label} />
            <Metric label="user" value={selected[1].choice.label} />
            <Metric label="flow" value={selected[2].choice.label} />
            <Metric label="handoff" value={selected[3].choice.label} />
          </div>
          <div className="mt-5 border-t border-line-soft/70 pt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              real shipped proof
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">
              This blueprint points toward {caseStudy.reason}.
            </p>
            <Link
              href={`/work/${caseStudy.slug}`}
              className="group mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-fg transition hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              Open {caseStudy.title} case study
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="border-l border-line-soft/70 pl-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
            build packet generated from your choices
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {build.packet.map((item, index) => (
              <li key={item} className="grid grid-cols-[22px_minmax(0,1fr)] gap-3 border-t border-line-soft/70 py-2 text-[12px] leading-relaxed text-fg-muted first:border-t-0 first:pt-0">
                <span className="flex size-7 items-center justify-center rounded-full border border-[var(--accent)]/45 font-mono text-[10px] text-[var(--accent)]">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
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
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-line-soft/70 bg-[oklch(0.13_0.006_250)] p-3 sm:p-4">
      <div aria-hidden className="absolute inset-0 [background:radial-gradient(640px_300px_at_50%_0%,rgba(255,255,255,.055),transparent_62%)]" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-amber-300/70" />
            <span className="size-2.5 rounded-full bg-emerald-300/70" />
          </div>
          <div className="font-mono text-[10px] lowercase tracking-[0.1em] text-white/45">launch-room.app / handoff</div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-3">
            <PreviewPanel show={visible >= 1} title="Product brief" icon={<Layers3 className="size-4" />}>
              <div className="text-[13px] leading-relaxed text-white/72">
                Build {getIndefiniteArticle(selected[0].choice.label)}{" "}
                <span className="text-white">{selected[0].choice.label}</span> for{" "}
                {getIndefiniteArticle(selected[1].choice.label)}{" "}
                <span className="text-white">{selected[1].choice.label.toLowerCase()}</span> with a
                clear first win.
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
                        transition={reduceMotion ? { duration: 0 } : undefined}
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
  const reduceMotion = useReducedMotion();
  const visibleState = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };
  const hiddenState = reduceMotion
    ? { opacity: 0.28 }
    : { opacity: 0.28, y: 14, filter: "blur(1.5px)" };

  return (
    <motion.div
      initial={false}
      animate={show ? visibleState : hiddenState}
      transition={
        reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }
      }
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

function getIndefiniteArticle(label: string) {
  return /^[aeiou]/i.test(label) ? "an" : "a";
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
