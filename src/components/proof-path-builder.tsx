"use client";

import Link from "next/link";
import { ArrowRight, Check, Compass, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

import { PROOF_MODES, getProofMode, type ProofModeId } from "@/lib/proof-path";
import { cn } from "@/lib/utils";

export function ProofPathBuilder() {
  const [modeId, setModeId] = useState<ProofModeId>("operator");
  const [openedStops, setOpenedStops] = useState<string[]>([]);
  const mode = useMemo(() => getProofMode(modeId), [modeId]);
  const complete = openedStops.filter((id) => id.startsWith(`${mode.id}:`)).length;

  function chooseMode(id: ProofModeId) {
    setModeId(id);
  }

  function markOpened(index: number) {
    const id = `${mode.id}:${index}`;
    setOpenedStops((current) => (current.includes(id) ? current : [...current, id]));
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-line-soft bg-bg/45 shadow-[0_28px_100px_rgba(0,0,0,.2)]">
      <div className="grid xl:grid-cols-[312px_minmax(0,1fr)]">
        <aside className="border-b border-line-soft bg-bg/60 p-5 xl:border-b-0 xl:border-r xl:p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
            <Compass className="size-3.5 text-[var(--accent)]" aria-hidden="true" />
            choose the proof you need
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
            This is not a project grid. Pick the capability under review and get a short, intentional path through the strongest evidence.
          </p>
          <div className="mt-6 grid gap-2" role="radiogroup" aria-label="Capability to evaluate">
            {PROOF_MODES.map((candidate) => {
              const selected = candidate.id === mode.id;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => chooseMode(candidate.id)}
                  className={cn(
                    "rounded-2xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent)]/[0.07]"
                      : "border-line-soft bg-bg-2/20 hover:border-line hover:bg-bg-2/40",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-[13px] font-medium text-fg">{candidate.label}</span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-fg-dim">{candidate.detail}</span>
                    </span>
                    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-[var(--accent)] text-[var(--accent)]" : "border-line text-transparent")}>
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-soft pb-5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">your evidence path</div>
              <h2 className="mt-2 font-sans text-[clamp(30px,5vw,52px)] font-medium leading-[0.95] tracking-[-0.045em] text-fg">{mode.outcome}</h2>
              <p className="mt-3 max-w-[66ch] text-[13px] leading-relaxed text-fg-muted">{mode.intro}</p>
            </div>
            <div className="rounded-full border border-line-soft bg-bg-2/25 px-3 py-2 font-mono text-[10px] lowercase text-fg-dim">
              {complete} / {mode.stops.length} proof stops opened
            </div>
          </div>

          <ol className="mt-5 grid gap-3">
            {mode.stops.map((stop, index) => {
              const opened = openedStops.includes(`${mode.id}:${index}`);
              return (
                <li key={stop.title} className="grid gap-4 rounded-2xl border border-line-soft bg-bg-2/[0.12] p-4 transition hover:border-line sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">{stop.eyebrow}</div>
                    <h3 className="mt-2 text-[19px] font-medium tracking-[-0.02em] text-fg">{stop.title}</h3>
                    <p className="mt-2 max-w-[65ch] text-[12px] leading-relaxed text-fg-muted">{stop.description}</p>
                    <div className="mt-3 font-mono text-[10px] lowercase tracking-[0.06em] text-[var(--accent)]">{stop.evidence}</div>
                  </div>
                  <Link
                    href={stop.href}
                    onClick={() => markOpened(index)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-line-soft bg-bg px-4 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-muted transition hover:border-[var(--accent)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {opened ? "reopen proof" : stop.action}
                    {opened ? <ExternalLink className="size-3.5" aria-hidden="true" /> : <ArrowRight className="size-3.5" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
