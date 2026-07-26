import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { ProductLaunchSimulator } from "@/components/lab/product-launch-simulator";
import { decodeLaunchBlueprint } from "@/lib/product-launch-blueprint";

export const metadata: Metadata = {
  title: "Product Launch Simulator",
  description:
    "Turn a messy product idea into a live interface blueprint, risk radar, timeline, and engineering handoff.",
  alternates: {
    canonical: "/lab/product-launch",
  },
};

export default async function ProductLaunchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialBlueprint = decodeLaunchBlueprint(await searchParams);
  const blueprintKey = JSON.stringify(initialBlueprint);

  return (
    <main className="min-h-screen px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <Link
          href="/#stack"
          className="group inline-flex items-center gap-2 rounded-sm font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <ArrowLeft
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Back to product workflow
        </Link>

        <header className="grid gap-8 pb-10 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-end lg:gap-16 lg:pb-14 lg:pt-20">
          <div>
            <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
              <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_55%,transparent)]" />
              Interactive product proof · about 90 seconds
            </div>
            <h1 className="heading-gradient w-fit max-w-[920px] font-sans text-[clamp(46px,8vw,100px)] font-medium leading-[0.9] tracking-[-0.055em]">
              Product Launch Simulator
            </h1>
          </div>

          <div className="border-l border-line-soft pl-5 sm:pl-7">
            <p className="max-w-[44ch] text-[15px] leading-relaxed text-fg-muted">
              Choose the product, audience, interaction model, handoff, and finish level. The demo
              compiles those constraints into a live interface preview and an engineering-ready
              build packet.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
              branching state · progressive preview · delivery trade-offs
            </p>
          </div>
        </header>

        <ProductLaunchSimulator key={blueprintKey} initialBlueprint={initialBlueprint} />

        <footer className="mt-10 flex flex-col gap-4 border-t border-line-soft pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[58ch] text-[12px] leading-relaxed text-fg-dim">
            Built as a compact proof of how I turn ambiguous product constraints into interface
            structure, implementation scope, and a shippable handoff.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/lab/scope"
              className="group inline-flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-fg-muted transition-colors hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              Turn an ambiguous brief into scope
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="mailto:hello@ilyamoskovkin.com?subject=Product%20idea%20for%20Ilya"
              className="group inline-flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-fg-muted transition-colors hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              Send me a messy product idea
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
