import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { BriefBuilder } from "@/components/brief-builder";

export const metadata: Metadata = {
  title: "Engagement Brief",
  description:
    "Turn a concrete product situation into a focused engineering conversation with Ilya Moskovkin.",
  alternates: { canonical: "/brief" },
};

export default function BriefPage() {
  return (
    <main className="min-h-screen px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <Link
          href="/#about"
          className="group inline-flex items-center gap-2 rounded-sm font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          Back to portfolio
        </Link>

        <header className="grid gap-8 pb-10 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-end lg:gap-16 lg:pb-14 lg:pt-20">
          <div>
            <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_55%,transparent)]" />
              Start a focused engineering conversation · about 2 minutes
            </div>
            <h1 className="heading-gradient max-w-[940px] font-sans text-[clamp(46px,8vw,100px)] font-medium leading-[0.9] tracking-[-0.055em]">
              Bring the situation, not a perfect spec.
            </h1>
          </div>
          <div className="border-l border-line-soft pl-5 sm:pl-7">
            <p className="max-w-[44ch] text-[15px] leading-relaxed text-fg-muted">
              State what is changing, choose the pressure that makes it hard, and shape a concise
              starting brief for a real product conversation.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
              clear scope · visible risk · direct next step
              <ArrowUpRight className="size-3" aria-hidden />
            </p>
          </div>
        </header>

        <BriefBuilder />
      </div>
    </main>
  );
}
