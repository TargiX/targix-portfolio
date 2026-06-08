"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Typed } from "@/components/typed";

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
  // plain DOM hero. When ready on desktop, the WebGL scene owns bg + the whole
  // left block + glass; the only DOM left is a transparent, clickable overlay
  // for the link. On mobile and in light mode the SDF typography is suppressed,
  // so DOM copy can use the active CSS palette and stay readable.
  const [webgl, setWebgl] = useState<"pending" | "ready" | "failed">("pending");
  const [linkRect, setLinkRect] = useState<HeroLayout["link"] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const time = useVietnamTime();
  const webglReady = webgl === "ready";
  const lightHero = resolvedTheme === "light";

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => {
      const manual = document.documentElement.dataset.theme;
      setResolvedTheme(manual === "light" ? "light" : manual === "dark" ? "dark" : system.matches ? "dark" : "light");
    };

    resolve();
    system.addEventListener("change", resolve);
    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      system.removeEventListener("change", resolve);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onLayout = useCallback((l: HeroLayout) => setLinkRect(l.link), []);

  // the DOM copy is shown on mobile and as the fallback when WebGL can't start.
  // On desktop (light or dark) the SDF text is drawn into the scene so the glass
  // cubes can refract it — that's the signature effect, so we keep it in light too.
  const showDomCopy = isMobile || webgl === "failed";

  return (
    <header
      className="relative isolate min-h-[78svh] w-full overflow-hidden"
      data-screen-label="00 Hero"
    >
      {/* full-bleed WebGL scene: ported bg shader + glass cubes (+ SDF typography
          on desktop). On mobile, text is suppressed and the copy lives in the DOM. */}
      <ThreeHero
        accent={lightHero ? "#15803d" : "#a3e635"}
        accent2={lightHero ? "#65a30d" : "#2dd4bf"}
        surface={resolvedTheme}
        onStatus={setWebgl}
        time={time}
        onLayout={onLayout}
        mobile={isMobile}
        suppressText={isMobile}
      />

      {/* SEO / a11y: the hero copy always lives in the DOM, even when WebGL paints it */}
      <div className="sr-only">
        <h1>Ilya Moskovkin, Senior frontend engineer</h1>
        <p>
          Senior frontend engineer with fullstack chops and UI/UX roots. Building experiences
          that matter. Based in Vietnam, open to remote roles. Stack: Vue, React, Node.
        </p>
      </div>

      {/* soft fade into the bg at the bottom + radial highlight.
          In light the grey radial would muddy the SDF text, so light gets only a
          clean bottom fade; the WebGL aurora handles the rest. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: lightHero
            ? "linear-gradient(180deg, transparent 64%, var(--bg) 100%)"
            : "radial-gradient(60% 80% at 20% 30%, color-mix(in oklab, var(--bg-3) 72%, var(--accent) 8%), transparent 70%), linear-gradient(180deg, transparent 55%, var(--bg) 100%)",
        }}
      />


      {/* transparent, clickable overlay for the "open the lab" link — desktop only
          (WebGL draws the visible text; this keeps it a real, focusable anchor). */}
      {webglReady && !isMobile && linkRect && (
        <a
          href="#lab"
          aria-label="interactive experiments: open the lab"
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

      {/* Pixi 2D bg only when the 3D scene can't initialise at all */}
      {webgl === "failed" && <PixiMetaballHero accent="#a3e635" />}

      {/* DOM copy — mobile (over the live 3D bg) + WebGL-failure fallback */}
      {showDomCopy && <HeroCopy />}
    </header>
  );
}

function HeroCopy() {
  return (
    <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-[1280px] flex-col justify-center px-5 pb-24 pt-6 sm:px-8">
      <div>
        <div className="mb-7 inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.3em] text-fg-dim">
          <span className="h-px w-5 bg-line" />
          IM / portfolio · v1.0
        </div>

        <h1 className="m-0 mb-6 font-sans text-[40px] font-medium leading-none tracking-[-0.025em] sm:text-[60px]">
          <Typed text="Ilya Moskovkin" />
        </h1>

        <p className="m-0 mb-7 max-w-[44ch] font-mono text-[15px] leading-[1.55] text-fg-muted sm:text-base">
          Senior <span className="text-fg">frontend</span> engineer with fullstack chops and{" "}
          <span className="text-fg">UI/UX</span> roots.
          <br />
          Building experiences that matter.
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-4 text-[11px] lowercase tracking-[0.04em] text-fg-dim">
          <MetaItem k="based" v="vietnam · remote" />
          <MetaItem k="years" v="10+" />
          <MetaItem k="stack" v="vue · react · node" />
          <MetaItem k="status" v={<span style={{ color: "oklch(0.78 0.16 145)" }}>open to roles</span>} />
        </div>

        <a
          href="#lab"
          className="group mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-fg-dim transition-colors hover:text-[var(--accent)]"
        >
          Interactive experiments: open the lab
        </a>
      </div>
    </div>
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
