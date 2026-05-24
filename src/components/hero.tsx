"use client";

import dynamic from "next/dynamic";
import { Typed } from "@/components/typed";
import { StatusBar } from "@/components/status-bar";
import { GlassForms } from "@/components/hero/glass-forms";

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
      {/* full-bleed reactive dot/aurora background */}
      <PixiMetaballHero accent="#a3e635" />

      {/* soft fade into the bg at the bottom + radial highlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 80% at 20% 30%, oklch(0.20 0.01 250 / .45), transparent 70%), linear-gradient(180deg, transparent 55%, var(--bg) 100%)",
        }}
      />

      {/* floating frosted-glass forms (below text, above bg) */}
      <GlassForms />

      {/* content */}
      <div className="relative z-10 mx-auto flex min-h-[86svh] max-w-[1000px] flex-col justify-center px-5 pb-24 pt-6 sm:px-8">
        <StatusBar />

        <div className="mb-7 inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.3em] text-fg-dim">
          <span className="h-px w-5 bg-line" />
          IM / portfolio · v1.0
        </div>

        <h1 className="m-0 mb-7 font-sans font-medium leading-[0.95] tracking-[-0.03em] text-[clamp(3rem,8vw,6rem)]">
          <Typed text="Ilya Moskovkin" />
        </h1>

        <p className="m-0 mb-8 max-w-[46ch] font-mono text-[17px] leading-[1.55] text-fg-muted sm:text-[19px]">
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
