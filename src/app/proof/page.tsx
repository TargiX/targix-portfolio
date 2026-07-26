import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { ProofPathBuilder } from "@/components/proof-path-builder";
import { getProofMode } from "@/lib/proof-path";

export const metadata: Metadata = {
  title: "Evidence Path",
  description:
    "Choose the product capability under review and follow a focused path through Ilya Moskovkin's shipped work.",
  alternates: { canonical: "/proof" },
};

export default async function ProofPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const mode = getProofMode(typeof query.for === "string" ? query.for : undefined);
  const initialOpenedIndexes = getOpenedStopIndexes(
    typeof query.opened === "string" ? query.opened : undefined,
    mode.stops.length,
  );

  return (
    <main className="min-h-screen px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <Link
          href="/#work"
          className="group inline-flex items-center gap-2 rounded-sm font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          Back to selected work
        </Link>

        <header className="grid gap-8 pb-10 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-end lg:gap-16 lg:pb-14 lg:pt-20">
          <div>
            <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_55%,transparent)]" />
              Interactive portfolio proof · about 5 minutes
            </div>
            <h1 className="heading-gradient max-w-[940px] font-sans text-[clamp(46px,8vw,100px)] font-medium leading-[0.9] tracking-[-0.055em]">
              Follow the proof, not the pitch.
            </h1>
          </div>
          <div className="border-l border-line-soft pl-5 sm:pl-7">
            <p className="max-w-[44ch] text-[15px] leading-relaxed text-fg-muted">
              Hiring for a specific capability? Pick the job to be done and get a deliberate sequence through the real product work that answers it.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
              role-aware review · concrete evidence · no generic project grid
            </p>
          </div>
        </header>

        <ProofPathBuilder initialModeId={mode.id} initialOpenedIndexes={initialOpenedIndexes} />

        <footer className="mt-10 flex flex-col gap-4 border-t border-line-soft pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[58ch] text-[12px] leading-relaxed text-fg-dim">
            Every path links to an existing case study or product surface. If you need a closer look at a similar problem, send the messy version.
          </p>
          <a
            href="mailto:hello@ilyamoskovkin.com?subject=Product%20problem%20to%20review"
            className="group inline-flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-fg-muted transition-colors hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            Send a product problem
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </footer>
      </div>
    </main>
  );
}

function getOpenedStopIndexes(value: string | undefined, totalStops: number) {
  if (!value) {
    return [];
  }

  return [...new Set(value.split(",").map(Number))].filter(
    (index) => Number.isInteger(index) && index >= 0 && index < totalStops,
  );
}
