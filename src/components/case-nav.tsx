"use client";

import Link from "next/link";

import type { CaseMeta } from "@/lib/content";
import { resetCaseScrollNow } from "@/components/case-route-reset";

type Props = {
  prev: CaseMeta | null;
  next: CaseMeta | null;
};

/**
 * Prev/next navigation strip at the bottom of a case study. Keeps the
 * recruiter reading — one obvious next step instead of a dead end.
 */
export function CaseNav({ prev, next }: Props) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid gap-4 border-t border-line-soft pt-8 sm:grid-cols-2">
      {prev ? (
        <NavLink direction="prev" c={prev} />
      ) : (
        // Empty placeholder keeps the grid balanced when only one side exists.
        <div />
      )}
      {next ? <NavLink direction="next" c={next} /> : <div />}
    </nav>
  );
}

function NavLink({ direction, c }: { direction: "prev" | "next"; c: CaseMeta }) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={`/work/${c.slug}`}
      onClickCapture={resetCaseScrollNow}
      onClick={resetCaseScrollNow}
      className={`group flex flex-col gap-1.5 rounded-lg border border-line-soft p-4 transition-colors hover:border-[color:color-mix(in_oklab,var(--accent)_40%,var(--line))] hover:bg-bg-2/30 ${
        isPrev ? "items-start" : "items-end text-right"
      }`}
    >
      <span className="font-mono text-[10px] lowercase tracking-[0.1em] text-fg-dim">
        {isPrev ? "← previous" : "next →"}
      </span>
      <span className="text-[15px] font-medium leading-snug text-fg transition-colors group-hover:text-[var(--accent)]">
        {c.title}
      </span>
      <span className="line-clamp-1 text-[11px] leading-relaxed text-fg-muted">
        {c.blurb}
      </span>
    </Link>
  );
}
