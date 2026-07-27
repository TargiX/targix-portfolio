"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, ClipboardCheck, Copy, Mail } from "lucide-react";

import { cn } from "@/lib/utils";

type Pressure = "clarity" | "reliability" | "delivery";
type Partnership = "shape" | "rescue" | "extend";
type Status = "idle" | "copied" | "error";

const PRESSURES: Array<{ id: Pressure; label: string; detail: string }> = [
  {
    id: "clarity",
    label: "The right first workflow is unclear",
    detail: "The team needs a useful first decision before a broad build creates expensive momentum.",
  },
  {
    id: "reliability",
    label: "A real workflow needs to recover gracefully",
    detail: "The UI has to keep people oriented through errors, review states, or an unreliable handoff.",
  },
  {
    id: "delivery",
    label: "A product surface needs senior ownership now",
    detail: "The direction exists, but a complex interface needs product judgment and implementation depth to land.",
  },
];

const PARTNERSHIPS: Array<{ id: Partnership; label: string; detail: string }> = [
  {
    id: "shape",
    label: "Shape the first credible slice",
    detail: "Turn a messy opportunity into one bounded workflow with a visible success signal.",
  },
  {
    id: "rescue",
    label: "Untangle a stuck product surface",
    detail: "Find the actual decision, interaction, or reliability gap that keeps a flow from working.",
  },
  {
    id: "extend",
    label: "Extend an established product carefully",
    detail: "Add a new capability without losing the existing interaction contract or delivery confidence.",
  },
];

const PRESSURE_COPY: Record<Pressure, string> = {
  clarity:
    "We need to make the first user workflow and the decision it unlocks concrete before expanding the surface.",
  reliability:
    "We need a product path that remains truthful and usable when a handoff, review, or asynchronous step does not go perfectly.",
  delivery:
    "We need senior product-engineering ownership to turn an already-important surface into something users can actually rely on.",
};

const PARTNERSHIP_COPY: Record<Partnership, string> = {
  shape:
    "Shape a narrow first slice, including the user journey, the non-goal, and the proof that it works.",
  rescue:
    "Trace the broken or ambiguous moment, make the recovery path legible, and leave the next owner with an implementable direction.",
  extend:
    "Carry an existing product contract forward with deliberate interaction, responsive behavior, and release-quality finish.",
};

export function BriefBuilder() {
  const [situation, setSituation] = useState("");
  const [pressure, setPressure] = useState<Pressure>("clarity");
  const [partnership, setPartnership] = useState<Partnership>("shape");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const normalizedSituation = situation.trim();
  const canBuild = normalizedSituation.length >= 24;
  const brief = useMemo(
    () => createBrief(normalizedSituation, pressure, partnership),
    [normalizedSituation, pressure, partnership],
  );
  const mailto = `mailto:hello@ilyamoskovkin.com?${new URLSearchParams({
    subject: "Product conversation · focused engineering brief",
    body: brief.email,
  }).toString()}`;

  function invalidate() {
    setReady(false);
    setStatus("idle");
  }

  async function copyBrief() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access unavailable");
      await navigator.clipboard.writeText(brief.markdown);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-line-soft bg-bg/45 shadow-[0_28px_100px_rgba(0,0,0,.2)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(850px_420px_at_92%_0%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_66%)]"
      />
      <div className="relative grid xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-line-soft p-5 sm:p-7 xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
            <span className="grid size-7 place-items-center rounded-md border border-line-soft bg-bg-2/45 text-[var(--accent)]">
              <ClipboardCheck className="size-3.5" aria-hidden />
            </span>
            Configure the starting point
          </div>
          <h2 className="mt-6 max-w-[15ch] font-sans text-[clamp(32px,5vw,58px)] font-medium leading-[0.94] tracking-[-0.045em] text-fg">
            Make the first useful conversation easy to have.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[14px] leading-relaxed text-fg-muted">
            This does not pretend to estimate a project. It gives both sides a concrete place to start:
            the situation, the pressure, and the kind of ownership that would be useful.
          </p>

          <label className="mt-8 block" htmlFor="engagement-situation">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">What is happening now?</span>
            <textarea
              id="engagement-situation"
              value={situation}
              onChange={(event) => {
                invalidate();
                setSituation(event.target.value);
              }}
              rows={7}
              placeholder="Example: Our operations team is moving a manual approval step into a customer-facing app, but the current flow hides why a request failed and who has to act next."
              className="mt-3 min-h-40 w-full resize-y rounded-2xl border border-line-soft bg-bg/60 px-4 py-3 text-[14px] leading-relaxed text-fg outline-none placeholder:text-fg-dim focus:border-[var(--accent)]/65 focus:ring-2 focus:ring-[var(--accent)]/15"
            />
            <span className="mt-2 block text-[11px] text-fg-dim">
              {canBuild
                ? "Enough context to shape a focused starting brief."
                : `${Math.max(24 - normalizedSituation.length, 0)} more characters to make the situation concrete.`}
            </span>
          </label>

          <ChoiceGroup
            label="Where is the pressure?"
            options={PRESSURES}
            value={pressure}
            onChange={(value) => {
              invalidate();
              setPressure(value);
            }}
          />
          <ChoiceGroup
            label="What kind of help would move it forward?"
            options={PARTNERSHIPS}
            value={partnership}
            onChange={(value) => {
              invalidate();
              setPartnership(value);
            }}
          />

          <button
            type="button"
            disabled={!canBuild}
            onClick={() => {
              setStatus("idle");
              setReady(true);
            }}
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 font-mono text-[12px] lowercase tracking-[0.06em] text-bg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Shape the conversation brief <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="min-w-0 p-5 sm:p-7" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              <Check className="size-4 text-[var(--accent)]" aria-hidden />
              {ready ? "Conversation brief ready" : "Your focused brief will appear here"}
            </div>
            {ready && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyBrief}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-line-soft bg-bg-2/30 px-3 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-muted transition hover:border-[var(--accent)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <Copy className="size-3.5" aria-hidden /> Copy brief
                </button>
                <a
                  href={mailto}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--accent)]/55 bg-[var(--accent)]/[0.07] px-3 font-mono text-[10px] lowercase tracking-[0.06em] text-fg transition hover:bg-[var(--accent)]/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <Mail className="size-3.5" aria-hidden /> Open email draft
                </a>
              </div>
            )}
          </div>

          {ready ? (
            <article className="mt-5 space-y-5" aria-label="Generated engagement brief">
              <section className="rounded-2xl border border-line-soft bg-bg-2/18 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">Situation to discuss</div>
                <p className="mt-3 text-[18px] leading-relaxed text-fg">{brief.situation}</p>
              </section>
              <BriefRow n="01" label="Pressure to resolve" body={brief.pressure} />
              <BriefRow n="02" label="Useful first engagement" body={brief.partnership} />
              <BriefRow n="03" label="A good first call should answer" body={brief.firstCall} accent />
              <p className="min-h-5 text-[12px] text-fg-dim" role="status">
                {status === "copied"
                  ? "Brief copied. Paste it into an email or project thread."
                  : status === "error"
                    ? "Could not copy the brief. Select the visible text and copy it manually."
                    : "Open email draft carries this exact brief into a direct conversation; no message is sent until you send it."}
              </p>
            </article>
          ) : (
            <div className="mt-5 grid min-h-[440px] place-items-center rounded-2xl border border-dashed border-line-soft bg-bg-2/12 p-8 text-center">
              <div className="max-w-[32ch]">
                <ClipboardCheck className="mx-auto size-5 text-[var(--accent)]" aria-hidden />
                <p className="mt-4 text-[15px] font-medium text-fg">No generic pitch before the context exists.</p>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                  Add the situation, choose the pressure, and the preview will keep the next conversation grounded in an actual product moment.
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

function BriefRow({ n, label, body, accent = false }: { n: string; label: string; body: string; accent?: boolean }) {
  return (
    <section className={cn("grid grid-cols-[30px_minmax(0,1fr)] gap-3 border-t border-line-soft/70 pt-4", accent && "border-[var(--accent)]/40") }>
      <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--accent)]">{n}</span>
      <div>
        <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">{label}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{body}</p>
      </div>
    </section>
  );
}

function createBrief(situation: string, pressure: Pressure, partnership: Partnership) {
  const resolvedSituation = situation || "Add a concrete product situation before creating a conversation brief.";
  const pressureLine = PRESSURE_COPY[pressure];
  const partnershipLine = PARTNERSHIP_COPY[partnership];
  const firstCall = "Which user moment is most important to improve first, what would make that moment visibly better, and what constraint must remain true while we get there?";

  return {
    situation: resolvedSituation,
    pressure: pressureLine,
    partnership: partnershipLine,
    firstCall,
    markdown: `# Focused product conversation brief\n\n## Situation to discuss\n${resolvedSituation}\n\n## Pressure to resolve\n${pressureLine}\n\n## Useful first engagement\n${partnershipLine}\n\n## A good first call should answer\n${firstCall}\n`,
    email: `Hi Ilya,\n\nI would like to start a focused product-engineering conversation.\n\nSituation to discuss:\n${resolvedSituation}\n\nPressure to resolve:\n${pressureLine}\n\nUseful first engagement:\n${partnershipLine}\n\nA good first call should answer:\n${firstCall}\n\nBest,`,
  };
}
