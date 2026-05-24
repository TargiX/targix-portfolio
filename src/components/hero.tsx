"use client";

import dynamic from "next/dynamic";
import { Typed } from "@/components/typed";
import { StatusBar } from "@/components/status-bar";

const PixiMetaballHero = dynamic(
  () => import("@/components/hero/pixi-metaball-hero").then((m) => m.PixiMetaballHero),
  { ssr: false },
);

const LiquidMetal = dynamic(
  () => import("@/components/hero/liquid-metal").then((m) => m.LiquidMetal),
  { ssr: false },
);

export function Hero() {
  return (
    <header
      className="relative isolate w-full overflow-hidden"
      data-screen-label="00 Hero"
    >
      {/* full-bleed reactive dot/aurora background */}
      <PixiMetaballHero accent="#a3e635" />

      {/* soft fade into the bg at the bottom + radial highlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(50% 70% at 25% 30%, oklch(0.20 0.01 250 / .45), transparent 70%), linear-gradient(180deg, transparent 60%, var(--bg) 100%)",
        }}
      />

      {/* full-width two-column layout: text left, liquid-metal right */}
      <div className="relative z-10 mx-auto grid min-h-[88svh] max-w-[1280px] grid-cols-1 items-center gap-6 px-6 pb-20 pt-4 lg:grid-cols-[1fr_minmax(420px,1fr)] lg:gap-10 lg:px-10">
        {/* ── text column ── */}
        <div className="flex flex-col justify-center">
          <StatusBar />

          <div className="mb-7 inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.3em] text-fg-dim">
            <span className="h-px w-5 bg-line" />
            IM / portfolio · v1.0
          </div>

          <h1 className="m-0 mb-6 font-sans text-[44px] font-medium leading-none tracking-[-0.025em] sm:text-[60px] xl:text-[68px]">
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

          <a
            href="#lab"
            className="group mt-8 inline-flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim transition-colors hover:text-[var(--accent)]"
          >
            here for the visual / motion work? open the lab
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* ── liquid-metal column ── */}
        <div className="relative h-[320px] w-full sm:h-[440px] lg:h-[78vh]">
          <LiquidMetal accent="#a3e635" />
          <div className="pointer-events-none absolute bottom-2 right-1 font-mono text-[10px] lowercase tracking-[0.08em] text-fg-dim/70">
            ↑ webgl · drag through it
          </div>
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
