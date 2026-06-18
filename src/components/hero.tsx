"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Typed } from "@/components/typed";

import { useVietnamTime } from "@/lib/use-vietnam-time";
import type { HeroLayout } from "@/components/hero/three-hero";

type ThreeHeroComponent = typeof import("@/components/hero/three-hero")["ThreeHero"];
type PixiHeroComponent = typeof import("@/components/hero/pixi-metaball-hero")["PixiMetaballHero"];

function runWhenIdle(cb: () => void, timeout = 1500) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }

  const id = globalThis.setTimeout(cb, 1);
  return () => globalThis.clearTimeout(id);
}

export function Hero() {
  // 'pending' until the WebGL hero comes up; on 'failed' we fall back to the
  // plain DOM hero. When ready on desktop, the WebGL scene owns bg + the whole
  // left block + glass; the only DOM left is a transparent, clickable overlay
  // for the link. On mobile and in light mode the SDF typography is suppressed,
  // so DOM copy can use the active CSS palette and stay readable.
  const [webgl, setWebgl] = useState<"pending" | "ready" | "failed">("pending");
  const [linkRect, setLinkRect] = useState<HeroLayout["link"] | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [ThreeHero, setThreeHero] = useState<ThreeHeroComponent | null>(null);
  const [PixiMetaballHero, setPixiMetaballHero] = useState<PixiHeroComponent | null>(null);
  const webglImportStartedRef = useRef(false);
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
  const onStatus = useCallback((status: "ready" | "failed") => {
    if (status === "ready") {
      requestAnimationFrame(() => setWebgl("ready"));
      return;
    }

    setWebgl("failed");
  }, []);

  const loadWebgl = useCallback(() => {
    if (webglImportStartedRef.current) return;
    webglImportStartedRef.current = true;

    import("@/components/hero/three-hero")
      .then((m) => setThreeHero(() => m.ThreeHero))
      .catch(() => setWebgl("failed"));
  }, []);

  useEffect(() => {
    if (isMobile === null || ThreeHero) return;

    let cancelIdle: (() => void) | undefined;
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      cancelIdle = runWhenIdle(loadWebgl);
    };

    // Desktop visitors should see the signature WebGL moment quickly. Mobile
    // gets a real first paint first, then upgrades after interaction or later idle.
    const delay = isMobile ? 12000 : 700;
    const timer = window.setTimeout(start, delay);
    const onIntent = () => {
      window.clearTimeout(timer);
      start();
    };

    window.addEventListener("pointerdown", onIntent, { once: true, passive: true });
    window.addEventListener("keydown", onIntent, { once: true });
    if (isMobile) {
      window.addEventListener("touchstart", onIntent, { once: true, passive: true });
      window.addEventListener("scroll", onIntent, { once: true, passive: true });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelIdle?.();
      window.removeEventListener("pointerdown", onIntent);
      window.removeEventListener("keydown", onIntent);
      window.removeEventListener("touchstart", onIntent);
      window.removeEventListener("scroll", onIntent);
    };
  }, [isMobile, loadWebgl, ThreeHero]);

  useEffect(() => {
    if (webgl !== "failed" || PixiMetaballHero) return;
    let active = true;

    import("@/components/hero/pixi-metaball-hero").then((m) => {
      if (active) setPixiMetaballHero(() => m.PixiMetaballHero);
    });

    return () => {
      active = false;
    };
  }, [webgl, PixiMetaballHero]);

  // the DOM copy is shown on mobile and as the fallback when WebGL can't start.
  // On desktop (light or dark) the SDF text is drawn into the scene so the glass
  // cubes can refract it - that's the signature effect, so we keep it in light too.
  const showDomCopy = isMobile !== false || !webglReady;

  return (
    <header
      className="relative isolate min-h-[78svh] w-full overflow-hidden"
      data-screen-label="00 Hero"
    >
      <div aria-hidden="true" className="hero-bg absolute inset-0 z-0" />

      {/* full-bleed WebGL scene: ported bg shader + glass cubes (+ SDF typography
          on desktop). On mobile, text is suppressed and the copy lives in the DOM. */}
      {ThreeHero && (
        <ThreeHero
          accent={lightHero ? "#15803d" : "#a3e635"}
          accent2={lightHero ? "#65a30d" : "#2dd4bf"}
          surface={resolvedTheme}
          onStatus={onStatus}
          time={time}
          onLayout={onLayout}
          mobile={isMobile ?? false}
          suppressText={isMobile ?? false}
          className={[
            "transition-opacity duration-700 ease-out will-change-opacity",
            webglReady ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      )}

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


      {/* transparent, clickable overlay for the "open the lab" link - desktop only
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
      {webgl === "failed" && PixiMetaballHero && <PixiMetaballHero accent="#a3e635" />}

      {/* DOM copy - mobile (over the live 3D bg) + WebGL-failure fallback */}
      <HeroCopy visible={showDomCopy} />
    </header>
  );
}

function HeroCopy({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={visible ? undefined : true}
      className={[
        "relative z-10 mx-auto flex min-h-[78svh] max-w-[1280px] flex-col justify-center px-5 pb-24 pt-6 transition-opacity duration-700 ease-out will-change-opacity sm:px-8",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
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

        <div className="grid max-w-full grid-cols-2 gap-x-4 gap-y-4 text-[11px] lowercase tracking-[0.04em] text-fg-dim sm:flex sm:flex-wrap sm:gap-x-5">
          <MetaItem k="based" v="vietnam · remote" />
          <MetaItem k="years" v="10+" />
          <MetaItem k="stack" v="vue · react · node" />
          <MetaItem
            k="status"
            v={<span style={{ color: "oklch(0.78 0.16 145)" }}>open to roles</span>}
            className="col-span-2 sm:col-span-1"
          />
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

function MetaItem({ k, v, className }: { k: string; v: React.ReactNode; className?: string }) {
  return (
    <span className={["flex min-w-0 items-center gap-2", className].filter(Boolean).join(" ")}>
      <span className="text-fg-muted">{k}</span>
      <span className="whitespace-nowrap text-fg">{v}</span>
    </span>
  );
}
