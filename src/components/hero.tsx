"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Typed } from "@/components/typed";
import { StatusBar } from "@/components/status-bar";
import { useVietnamTime } from "@/lib/use-vietnam-time";
import type { HeroLayout } from "@/components/hero/three-hero";

const ThreeHero = dynamic(
  () => import("@/components/hero/three-hero").then((m) => m.ThreeHero),
  { ssr: false },
);

// Reliable 2D Pixi hero — only mounts when the 3D scene can't initialise
// (locked-down browsers, no WebGL context). Keeps the fallback from looking raw.
const PixiMetaballHero = dynamic(
  () => import("@/components/hero/pixi-metaball-hero").then((m) => m.PixiMetaballHero),
  { ssr: false },
);

export function Hero() {
  // 'pending' until the WebGL hero comes up; on 'failed' we fall back to the
  // plain DOM hero. When ready, the WebGL scene owns bg + the whole left block
  // + glass; the only DOM left is a transparent, clickable overlay for the link.
  const [webgl, setWebgl] = useState<"pending" | "ready" | "failed">("pending");
  const [linkRect, setLinkRect] = useState<HeroLayout["link"] | null>(null);
  const time = useVietnamTime();
  const webglReady = webgl === "ready";

  const onLayout = useCallback((l: HeroLayout) => setLinkRect(l.link), []);

  return (
    <header
      className="relative isolate min-h-[78svh] w-full overflow-hidden"
      data-screen-label="00 Hero"
    >
      {/* full-bleed WebGL scene: ported bg shader + SDF typography + glass */}
      <ThreeHero accent="#a3e635" accent2="#2dd4bf" onStatus={setWebgl} time={time} onLayout={onLayout} />

      {/* SEO / a11y: the hero copy always lives in the DOM, even when WebGL paints it */}
      <div className="sr-only">
        <h1>Ilya Moskovkin — Senior frontend engineer</h1>
        <p>
          Senior frontend engineer with fullstack chops and UI/UX roots. Building products, not
          pages. Based in Vietnam, open to remote roles. Stack: Vue, React, Node.
        </p>
      </div>

      {/* soft fade into the bg at the bottom + radial highlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 80% at 20% 30%, oklch(0.20 0.01 250 / .45), transparent 70%), linear-gradient(180deg, transparent 55%, var(--bg) 100%)",
        }}
      />

      {/* transparent, clickable overlay for the "open the lab" link (WebGL draws
          the visible text; this keeps it a real, focusable anchor). */}
      {webglReady && linkRect && (
        <a
          href="#lab"
          aria-label="here for the visual / motion work? open the lab"
          className="absolute z-20 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          style={{
            left: linkRect.x,
            top: linkRect.y,
            width: linkRect.w,
            height: linkRect.h,
            color: "transparent",
          }}
        >
          open the lab
        </a>
      )}

      {/* fallback — reliable Pixi 2D hero when the 3D scene can't initialise */}
      {webgl === "failed" && <PixiMetaballHero accent="#a3e635" />}
      {webgl === "failed" && (
        <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-[1280px] flex-col justify-center px-5 pb-24 pt-6 sm:px-8">
          <StatusBar />
          <div>
            <div className="mb-7 inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.3em] text-fg-dim">
              <span className="h-px w-5 bg-line" />
              IM / portfolio · v1.0
            </div>

            <h1 className="m-0 mb-6 font-sans text-[44px] font-medium leading-none tracking-[-0.025em] sm:text-[60px]">
              <Typed text="Ilya Moskovkin" />
            </h1>

            <p className="m-0 mb-7 max-w-[44ch] font-mono text-base leading-[1.55] text-fg-muted">
              Senior <span className="text-fg">frontend</span> engineer with fullstack chops and{" "}
              <span className="text-fg">UI/UX</span> roots.
              <br />
              Building products, not pages.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-4 text-[11px] lowercase tracking-[0.04em] text-fg-dim">
              <MetaItem k="based" v="vietnam → remote" />
              <MetaItem k="years" v="12+" />
              <MetaItem k="stack" v="vue · react · node" />
              <MetaItem k="status" v={<span style={{ color: "oklch(0.78 0.16 145)" }}>open to roles</span>} />
            </div>

            <a
              href="#lab"
              className="group mt-8 inline-flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim transition-colors hover:text-[var(--accent)]"
            >
              here for the visual / motion work? open the lab
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      )}
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
