"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  FileText,
  Mail,
  X,
} from "lucide-react";
import { InteractiveSkills } from "@/components/interactive-skills";
import { GlassDashboardStack } from "@/components/hero/glass-dashboard-stack";
import { CONTACT } from "@/lib/data";

type WebglHeroBackgroundComponent =
  (typeof import("@/components/hero/webgl-hero-background"))["WebglHeroBackground"];
type PixiHeroComponent =
  (typeof import("@/components/hero/pixi-metaball-hero"))["PixiMetaballHero"];

function runWhenIdle(cb: () => void, timeout = 1500) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }

  const id = globalThis.setTimeout(cb, 1);
  return () => globalThis.clearTimeout(id);
}

export function Hero() {
  // 'pending' until the lightweight WebGL background paints its first frame;
  // on 'failed' the CSS/Pixi fallback keeps the hero usable.
  const [webgl, setWebgl] = useState<"pending" | "ready" | "failed">("pending");
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [WebglHeroBackground, setWebglHeroBackground] =
    useState<WebglHeroBackgroundComponent | null>(null);
  const [PixiMetaballHero, setPixiMetaballHero] =
    useState<PixiHeroComponent | null>(null);
  const webglImportStartedRef = useRef(false);
  const webglReady = webgl === "ready";
  const lightHero = resolvedTheme === "light";

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => {
      const manual = document.documentElement.dataset.theme;
      setResolvedTheme(
        manual === "light"
          ? "light"
          : manual === "dark"
            ? "dark"
            : system.matches
              ? "dark"
              : "light",
      );
    };

    resolve();
    system.addEventListener("change", resolve);
    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
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

    import("@/components/hero/webgl-hero-background")
      .then((m) => setWebglHeroBackground(() => m.WebglHeroBackground))
      .catch(() => setWebgl("failed"));
  }, []);

  useEffect(() => {
    if (isMobile === null || WebglHeroBackground) return;

    let cancelIdle: (() => void) | undefined;
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      cancelIdle = runWhenIdle(loadWebgl);
    };

    // Desktop gets a real first paint, then the lightweight canvas background
    // initializes before the dashboard stack begins its entrance.
    const delay = isMobile ? 12000 : 120;
    const timer = window.setTimeout(start, delay);
    const onIntent = () => {
      window.clearTimeout(timer);
      start();
    };

    window.addEventListener("pointerdown", onIntent, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", onIntent, { once: true });
    if (isMobile) {
      window.addEventListener("touchstart", onIntent, {
        once: true,
        passive: true,
      });
      window.addEventListener("scroll", onIntent, {
        once: true,
        passive: true,
      });
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
  }, [isMobile, loadWebgl, WebglHeroBackground]);

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

  return (
    <header
      className="hero-shell relative isolate w-full overflow-hidden"
      data-screen-label="00 Hero"
    >
      <div aria-hidden="true" className="hero-bg absolute inset-0 z-0" />

      {/* full-bleed WebGL scene: background shader only. */}
      {WebglHeroBackground && (
        <WebglHeroBackground
          accent={lightHero ? "#15803d" : "#a3e635"}
          accent2={lightHero ? "#65a30d" : "#2dd4bf"}
          surface={resolvedTheme}
          onStatus={onStatus}
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
      {webgl === "failed" && PixiMetaballHero && (
        <PixiMetaballHero accent="#a3e635" />
      )}

      {/* DOM copy - always visible now for crisp text */}
      <HeroCopy />

      {webgl !== "pending" && <GlassDashboardStack />}

      <div className="absolute inset-x-0 bottom-8 z-20 hidden px-5 sm:px-8 md:block">
        <div className="mx-auto w-full max-w-[1280px]">
          <InteractiveSkills />
        </div>
      </div>
    </header>
  );
}

function HeroCopy() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="hero-copy-shell relative z-10 mx-auto flex max-w-[1280px] flex-col justify-center px-5 pb-7 pt-6 sm:px-8 xl:px-0 md:pb-32">
      <div className="w-full">
        {/* Subtitle */}
        <div className="mb-5 font-mono text-[15px] font-semibold uppercase tracking-[1.8px] text-fg-muted">
          SENIOR FRONT END DEVELOPER
        </div>

        <h1 className="m-0 max-w-[760px] font-sans text-[64px] font-light leading-[0.95] tracking-tight text-fg sm:text-[88px] md:text-[104px] md:leading-[111px] lg:text-[96px] xl:text-[108px]">
          Ilya
          <br />
          Moskovkin
        </h1>

        <div
          className="mx-[5px] my-[26px] h-[3px] w-[47px] rounded-full bg-[var(--accent)] shadow-[0_0_22px_color-mix(in_oklab,var(--accent)_42%,transparent)]"
          aria-hidden="true"
        />

        <p className="m-0 max-w-[780px] font-sans text-[32px] font-light leading-[1.18] tracking-tight text-fg sm:text-[36px]">
          I architect{" "}
          <span className="text-[var(--accent)]">
            scalable interfaces
          </span>
          <br className="hidden sm:block" />
          {" "}and ship AI-powered products.
        </p>

        <p className="mt-[18px] max-w-[510px] font-sans text-[20px] font-light leading-[1.55] text-[lab(52_0_-0.01)]">
          From system design to polished UI - I turn complexity into products
          people rely on.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap items-center gap-5 sm:gap-16">
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="inline-flex h-14 items-center justify-center gap-5 rounded-md bg-[var(--accent)] px-7 font-mono text-[15px] font-bold tracking-wide text-black shadow-[0_18px_42px_color-mix(in_oklab,var(--accent)_28%,transparent)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Contact Me
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
          <a
            href="#work"
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-md px-1 font-mono text-[13px] font-semibold tracking-[0.05em] text-fg transition-colors hover:text-[var(--accent)] sm:text-[14px]"
          >
            View selected work
            <span className="text-fg-dim transition-colors group-hover:text-[var(--accent)]">
              ::
            </span>
          </a>
        </div>
        <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

        <div className="mt-8 md:hidden">
          <InteractiveSkills />
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="mt-8 flex max-w-[550px] flex-wrap items-center gap-6 border-t border-line-soft pt-5 sm:mt-12 sm:gap-10">
        <div className="flex items-center gap-2.5">
          <div className="font-sans text-2xl font-bold tracking-tighter text-fg sm:text-3xl">
            10+
          </div>
          <div className="font-mono text-[9px] uppercase leading-tight tracking-widest text-fg-dim sm:text-[10px]">
            Years
            <br />
            Experience
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="font-sans text-2xl font-bold tracking-tighter text-fg sm:text-3xl">
            15+
          </div>
          <div className="font-mono text-[9px] uppercase leading-tight tracking-widest text-fg-dim sm:text-[10px]">
            Projects
            <br />
            Shipped
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="font-sans text-2xl font-bold tracking-tighter text-fg sm:text-3xl">
            10845
          </div>
          <div className="font-mono text-[9px] uppercase leading-tight tracking-widest text-fg-dim sm:text-[10px]">
            Coffee cups
            <br />
            consumed
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const iconFor = (key: string) => {
    if (key === "email") return Mail;
    if (key === "github") return Code2;
    if (key === "linkedin") return BriefcaseBusiness;
    return FileText;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close contact menu"
        className="absolute inset-0 bg-black/78 backdrop-blur-lg"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contact links"
        className="relative w-full max-w-[420px] overflow-hidden rounded-lg border border-line-soft bg-bg p-4 shadow-2xl shadow-black/20"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
              contact
            </div>
            <div className="mt-1 font-sans text-[22px] font-medium tracking-[-0.02em] text-fg">
              Let&apos;s talk
            </div>
          </div>
          <button
            type="button"
            aria-label="Close contact menu"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-line-soft text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-2">
          {CONTACT.map((item) => {
            const Icon = iconFor(item.key);
            const external = /^https?:\/\//.test(item.href);
            return (
              <a
                key={item.key}
                href={item.href}
                target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group flex items-center gap-3 rounded-md border border-line-soft bg-bg-2/50 px-3 py-3 text-left transition-colors hover:border-[var(--accent)] hover:bg-bg-2"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-bg text-fg-muted transition-colors group-hover:text-[var(--accent)]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
                    {item.key}
                  </span>
                  <span className="block truncate text-[13px] text-fg">{item.label}</span>
                </span>
                {external && (
                  <ExternalLink className="size-3.5 shrink-0 text-fg-dim transition-colors group-hover:text-[var(--accent)]" aria-hidden="true" />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
