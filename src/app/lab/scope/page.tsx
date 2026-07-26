import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { ScopeConsole } from "@/components/lab/scope-console";

export const metadata: Metadata = {
  title: "Scope Console",
  description:
    "Turn an ambiguous product brief into a bounded, reviewable first-slice memo with visible risks and next decisions.",
  alternates: {
    canonical: "/lab/scope",
  },
};

export default function ScopeConsolePage() {
  return (
    <main className="min-h-screen px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <Link
          href="/lab/product-launch"
          className="group inline-flex items-center gap-2 rounded-sm font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Back to Product Launch Simulator
        </Link>

        <header className="grid gap-8 pb-10 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-end lg:gap-16 lg:pb-14 lg:pt-20">
          <div>
            <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_55%,transparent)]" />
              Interactive product proof · about 2 minutes
            </div>
            <h1 className="heading-gradient max-w-[860px] font-sans text-[clamp(46px,8vw,100px)] font-medium leading-[0.9] tracking-[-0.055em]">
              Scope Console
            </h1>
          </div>

          <div className="border-l border-line-soft pl-5 sm:pl-7">
            <p className="max-w-[44ch] text-[15px] leading-relaxed text-fg-muted">
              Before an interface, there is a decision: what gets built first, what stays out, and what a
              human needs to review. This small console makes that boundary tangible.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
              explicit assumptions · visible risk · reusable handoff
            </p>
          </div>
        </header>

        <ScopeConsole />

        <footer className="mt-10 flex flex-col gap-4 border-t border-line-soft pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[58ch] text-[12px] leading-relaxed text-fg-dim">
            A compact proof that I can turn ambiguous requirements into a bounded product decision before
            making the interface look finished.
          </p>
          <a
            href="mailto:hello@ilyamoskovkin.com?subject=Messy%20product%20brief%20for%20Ilya"
            className="group inline-flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-fg-muted transition-colors hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            Send me a messy product brief
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </a>
        </footer>
      </div>
    </main>
  );
}
