"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Typed } from "@/components/typed";
import { InteractiveSkills } from "@/components/interactive-skills";
import { GlassDashboardStack } from "@/components/hero/glass-dashboard-stack";

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

  const onLayout = useCallback((l: HeroLayout) => { }, []);
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

  // Mobile keeps DOM copy because the WebGL typography is intentionally
  // suppressed there.
  const showDomCopy = isMobile === true || webgl === "failed";

  return (
    <header
      className="relative isolate min-h-[calc(92svh-var(--nav-h))] w-full overflow-hidden"
      data-screen-label="00 Hero"
    >
      <div aria-hidden="true" className="hero-bg absolute inset-0 z-0" />

      {/* full-bleed WebGL scene: ported bg shader + glass cubes. Text is suppressed. */}
      {ThreeHero && (
        <ThreeHero
          accent={lightHero ? "#15803d" : "#a3e635"}
          accent2={lightHero ? "#65a30d" : "#2dd4bf"}
          surface={resolvedTheme}
          onStatus={onStatus}
          time={time}
          onLayout={onLayout}
          mobile={isMobile ?? false}
          suppressText={true}
          suppressGlass
          className={[
            "transition-opacity duration-700 ease-out will-change-opacity",
            webglReady ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      )}

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



      {/* Pixi 2D bg only when the 3D scene can't initialise at all */}
      {webgl === "failed" && PixiMetaballHero && <PixiMetaballHero accent="#a3e635" />}

      {/* DOM copy - always visible now for crisp text */}
      <HeroCopy />

      <GlassDashboardStack />

      <div className="absolute inset-x-0 bottom-4 z-20 hidden px-5 sm:px-8 md:block">
        <div className="mx-auto w-full max-w-[1280px]">
          <InteractiveSkills />
        </div>
      </div>
    </header>
  );
}

function HeroCopy() {
  return (
    <div className="relative z-10 mx-auto flex min-h-[calc(92svh-var(--nav-h))] max-w-[1280px] flex-col justify-center px-5 pb-7 pt-6 sm:px-8 xl:px-0 md:pb-32">
      <div className="w-full">
        {/* Subtitle */}
        <div className="mb-1 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80  sm:text-[13px]">
          SENIOR FRONTEND ENGINEER
        </div>

        {/* Headline */}
        <h1 className="m-0 mb-8 max-w-[850px] font-sans text-[44px] font-light leading-[1.1] tracking-tight text-white sm:text-[64px] md:text-[84px]">
          Ilya Moskovkin
        </h1>

        {/* Value Props Bullets */}
        <ul className="mb-8 flex max-w-[850px] flex-col gap-3 font-sans text-[13px] leading-relaxed text-white/80 sm:text-[15px]">
          <li className="flex items-start gap-2.5">
            <svg className="mt-1 size-4 shrink-0 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span><strong className="font-bold text-white">Proactive Architect:</strong> I suggest architectures that actually scale and save time.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <svg className="mt-1 size-4 shrink-0 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span><strong className="font-bold text-white">Cutting Edge:</strong> Always utilizing modern tech (React 19, Vue 3, AI Workflows).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <svg className="mt-1 size-4 shrink-0 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span><strong className="font-bold text-white">Product Owner Mindset:</strong> full ownership of the frontend, from architecture to delivery.</span>
          </li>
        </ul>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--accent)] px-6 font-mono text-[14px] font-bold tracking-wide text-[#000] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Contact Me
          </button>
          <a
            href="#work"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 font-mono text-[13px] tracking-wide text-fg transition-colors hover:text-white"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
              <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </span>
            View My Projects
          </a>
        </div>

        <div className="mt-8 md:hidden">
          <InteractiveSkills />
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-5 sm:mt-12 sm:gap-10">
        <div className="flex items-center gap-2.5">
          <div className="font-sans text-2xl font-bold tracking-tighter text-white sm:text-3xl">10+</div>
          <div className="font-mono text-[9px] uppercase leading-tight tracking-widest text-fg-dim sm:text-[10px]">Years<br />Experience</div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="font-sans text-2xl font-bold tracking-tighter text-white sm:text-3xl">50+</div>
          <div className="font-mono text-[9px] uppercase leading-tight tracking-widest text-fg-dim sm:text-[10px]">Projects<br />Shipped</div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="font-sans text-2xl font-bold tracking-tighter text-white sm:text-3xl">UTC+7</div>
          <div className="font-mono text-[9px] uppercase leading-tight tracking-widest text-fg-dim sm:text-[10px]">Remote<br />Vietnam</div>
        </div>
      </div>
    </div>
  );
}
