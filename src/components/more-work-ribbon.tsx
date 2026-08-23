"use client";

import type { Project } from "@/lib/data";
import { CompactProjectCard } from "@/components/compact-project-card";
import { Reveal } from "@/components/reveal";

/**
 * Horizontal scroller for the lighter independent-work tier. Each card parks on
 * horizontal scroll-snap (`.ribbon-track` / `.ribbon-item` in globals.css),
 * so it reads as a deliberate shelf rather than a cramped 4-col grid. Cards
 * reuse <CompactProjectCard> verbatim — same media + monogram fallback.
 *
 */
export function MoreWorkRibbon({ projects }: { projects: Project[] }) {
  return (
    <div className="relative">
      <Reveal>
        <div className="mb-5 flex items-baseline gap-3">
          <span className="font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">
            independent work
          </span>
          <span className="font-sans text-[18px] font-medium tracking-[-0.01em] text-fg">
            Focused products and systems
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" aria-hidden />
        </div>
      </Reveal>

      <div className="relative max-w-full overflow-hidden">
        <div
          className="ribbon-track flex snap-x items-stretch gap-3 overflow-x-auto pb-2"
          aria-label="More work — scroll horizontally"
        >
          {projects.map((p) => (
            <div
              key={p.title}
              className="ribbon-item flex w-[clamp(230px,23vw,278px)] flex-shrink-0"
            >
              <div className="relative flex h-full w-full">
                <CompactProjectCard project={p} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
