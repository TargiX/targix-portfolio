import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { ExperimentGallery } from "@/components/lab/experiment-gallery";

export const metadata: Metadata = {
  title: "Interaction Lab",
  description:
    "Four working interface studies by Ilya Moskovkin: editing, AI workflow, prompt compilation, and product handoff.",
  alternates: {
    canonical: "/lab",
  },
};

export default function LabPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1280px] px-5 pb-20 pt-5 sm:px-8 sm:pt-8">
      <nav className="flex items-center justify-between gap-4 border-b border-line-soft pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim transition-colors hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to portfolio
        </Link>
        <Link
          href="/lab/product-launch"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-fg transition-colors hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          Product Launch Simulator
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </nav>

      <section className="grid gap-8 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-end lg:py-16">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">
            Interaction lab
          </div>
          <h1 className="mt-4 max-w-[11ch] font-sans text-[clamp(42px,7vw,88px)] font-medium leading-[0.92] tracking-[-0.06em] text-fg">
            Product behavior, not mockups.
          </h1>
        </div>
        <p className="max-w-[52ch] text-[15px] leading-relaxed text-fg-muted lg:pb-1">
          Four compact systems that make the actual work visible: editing under constraints, turning
          visual choices into model instructions, safe AI interaction, and a decision flow that ends
          in a concrete handoff.
        </p>
      </section>

      <ExperimentGallery />
    </main>
  );
}
