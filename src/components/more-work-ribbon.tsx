"use client";

import { useRef } from "react";
import type { Project } from "@/lib/data";
import { CompactProjectCard } from "@/components/compact-project-card";
import { Reveal } from "@/components/reveal";

/**
 * Horizontal scroller for the lighter "more work" tier. Each card parks on
 * horizontal scroll-snap (`.ribbon-track` / `.ribbon-item` in globals.css),
 * so it reads as a deliberate shelf rather than a cramped 4-col grid. Cards
 * reuse <CompactProjectCard> verbatim — same media + monogram fallback.
 *
 * Concept/fictional projects get an explicit badge so the work is never
 * mistaken for real-client claims (HelixCare ships fake logos + compliance
 * text on its demo; we surface "concept" up front).
 */
export function MoreWorkRibbon({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(360, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <Reveal>
        <div className="mb-5 flex items-baseline gap-3">
          <span className="font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">
            more work
          </span>
          <span className="font-sans text-[18px] font-medium tracking-[-0.01em] text-fg">
            Side builds & concept demos
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" aria-hidden />
        </div>
      </Reveal>

      <div className="relative">
        <div
          ref={trackRef}
          className="ribbon-track flex snap-x items-start gap-3 overflow-x-auto pb-2"
          aria-label="More work — scroll horizontally"
        >
          {projects.map((p) => (
            <div
              key={p.title}
              className="ribbon-item w-[clamp(230px,23vw,278px)] flex-shrink-0"
            >
              <div className="relative h-full">
                <CompactProjectCard project={p} />
                {/* concept flag — pinned over the card so it can't be missed */}
                {/concept|fictional/i.test(p.role) && (
                  <span className="pointer-events-none absolute right-2 top-2 z-30 rounded-full border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--accent)] backdrop-blur">
                    concept
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* edge hint arrows (desktop) — only when there's overflow to scroll */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="scroll left"
          className="absolute -left-4 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/85 text-fg-muted backdrop-blur transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] md:flex"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="scroll right"
          className="absolute -right-4 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/85 text-fg-muted backdrop-blur transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] md:flex"
        >
          →
        </button>
      </div>
    </div>
  );
}
