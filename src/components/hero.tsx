"use client";

import dynamic from "next/dynamic";
import { Typed } from "@/components/typed";
import { StatusBar } from "@/components/status-bar";

const PixiMetaballHero = dynamic(
  () => import("@/components/hero/pixi-metaball-hero").then((m) => m.PixiMetaballHero),
  { ssr: false },
);

export function Hero() {
  return (
    <header
      className="relative isolate w-full overflow-hidden"
      data-screen-label="00 Hero"
    >
      {/* full-bleed background canvas */}
      <PixiMetaballHero accent="#a3e635" />

      {/* soft fade into the bg at the bottom + radial highlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 80% at 20% 30%, oklch(0.20 0.01 250 / .45), transparent 70%), linear-gradient(180deg, transparent 55%, var(--bg) 100%)",
        }}
      />

      {/* content — width-constrained, stacked above canvas */}
      <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-[880px] flex-col justify-center px-5 pb-24 pt-6 sm:px-8">
        <StatusBar />

        <div className="mb-7 inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.3em] text-fg-dim">
          <span className="h-px w-5 bg-line" />
          IM / portfolio · v1.0
        </div>

        <h1 className="m-0 mb-6 font-sans text-[44px] font-medium leading-none tracking-[-0.025em] sm:text-[60px]">
          <Typed text="Ilya Moskovkin" />
        </h1>

        <p className="m-0 mb-7 max-w-[44ch] font-mono text-base leading-[1.55] text-fg-muted">
          Senior <span className="text-fg">frontend</span> engineer with fullstack chops
          and <span className="text-fg">UI/UX</span> roots.
          <br />
          Building products, not pages.
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-4 text-[11px] lowercase tracking-[0.04em] text-fg-dim">
          <MetaItem k="based" v="vietnam → remote" />
          <MetaItem k="years" v="8+" />
          <MetaItem k="stack" v="vue · react · node" />
          <MetaItem
            k="status"
            v={<span style={{ color: "oklch(0.78 0.16 145)" }}>open to roles</span>}
          />
        </div>
      </div>
    </header>
  );
}

function MetaItem({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-fg-muted">{k}</span>
      <span className="text-fg">{v}</span>
    </span>
  );
}
