"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useVietnamTime } from "@/lib/use-vietnam-time";
import { cn } from "@/lib/utils";

type View = "work" | "lab" | "about";
const ORDER: View[] = ["work", "about", "lab"];

const TABS: { id: View; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "lab", label: "Lab" },
];

const tabId = (view: View) => `portfolio-tab-${view}`;
const panelId = (view: View) => `portfolio-panel-${view}`;

type Axis = "x" | "y";
type Custom = { dir: number; axis: Axis };

const variants = {
  // nav clicks slide sideways; scroll advances rise from below (vertical scene change)
  enter: ({ dir, axis }: Custom) =>
    axis === "y" ? { y: 64, opacity: 0 } : { x: dir > 0 ? 90 : -90, opacity: 0 },
  center: { x: 0, y: 0, opacity: 1 },
  exit: ({ dir, axis }: Custom) =>
    axis === "y" ? { y: -48, opacity: 0 } : { x: dir > 0 ? -90 : 90, opacity: 0 },
};

export function ViewSwitcher({
  work,
  lab,
  about,
}: {
  work: ReactNode;
  lab: ReactNode;
  about: ReactNode;
}) {
  const [view, setView] = useState<View>("work");
  const viewRef = useRef<View>(view);
  viewRef.current = view;
  const [dir, setDir] = useState(1);
  const [axis, setAxis] = useState<Axis>("x");
  const [instant, setInstant] = useState(false);
  const time = useVietnamTime();

  const lockRef = useRef(false);
  const accRef = useRef(0);
  const lastWheelRef = useRef(0);
  const touchYRef = useRef(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (next: View, opts: { axis?: Axis; push?: boolean; instant?: boolean } = {}) => {
      const { axis: nextAxis = "x", push = true, instant: instantNext = false } = opts;
      setView((cur) => {
        if (cur === next) return cur;
        return next;
      });
      // Read via ref to avoid side effects inside the updater
      const cur = viewRef.current;
      if (cur === next) return;
      setDir(ORDER.indexOf(next) > ORDER.indexOf(cur) ? 1 : -1);
      if (instantNext) setInstant(true);
      setAxis(nextAxis);
      // No scroll animation here — the actual reset happens instantly in
      // onExitComplete, hidden under the transition. Animating the scroll +
      // sliding at the same time is what made it feel queasy.
      if (push && typeof window !== "undefined") {
        history.replaceState(null, "", `#${next}`);
      }
    },
    [],
  );

  // sync with hash (so hero's "#lab" link + back/forward work)
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as View;
      if (ORDER.includes(h)) {
        go(h, { push: false, instant: true });
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [go]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!instant) return;

    window.scrollTo({ top: 0, behavior: "auto" });
    const id = window.setTimeout(() => setInstant(false), 80);

    return () => window.clearTimeout(id);
  }, [instant, view]);

  // overscroll-to-advance: at the bottom of a panel, keep scrolling to slide
  // to the next zone; at the top, scroll up to go back. Requires accumulated
  // intent + a cooldown so it never jumps on a casual arrival at the edge.
  useEffect(() => {
    const THRESHOLD = 160; // accumulated overscroll px before advancing
    const COOLDOWN = 850;

    const doc = () => document.documentElement;
    const atBottom = () => window.innerHeight + window.scrollY >= doc().scrollHeight - 2;
    const atTop = () => window.scrollY <= 1;

    const advance = (delta: number) => {
      const idx = ORDER.indexOf(view);
      if (delta > 0 && atBottom() && idx < ORDER.length - 1) {
        lockRef.current = true;
        accRef.current = 0;
        go(ORDER[idx + 1], { axis: "y" });
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = setTimeout(() => (lockRef.current = false), COOLDOWN);
        return true;
      }
      if (delta < 0 && atTop() && idx > 0) {
        lockRef.current = true;
        accRef.current = 0;
        go(ORDER[idx - 1], { axis: "y" });
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = setTimeout(() => (lockRef.current = false), COOLDOWN);
        return true;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (lockRef.current) return;
      const now = Date.now();
      if (now - lastWheelRef.current > 250) accRef.current = 0; // decay between bursts
      lastWheelRef.current = now;

      const goingDown = e.deltaY > 0;
      const atEdge = goingDown ? atBottom() : atTop();
      if (!atEdge) {
        accRef.current = 0;
        return;
      }
      accRef.current += e.deltaY;
      if (Math.abs(accRef.current) > THRESHOLD) advance(accRef.current);
    };

    // touch mirrors the wheel: accumulate over-pull *while already at the edge*,
    // not total finger travel. Measuring displacement from touchstart (the old
    // behaviour) fired on a normal drag that happened to reach the bottom of a
    // long panel; this only counts deliberate continued pulling past the edge
    // and resets the moment you scroll back into content.
    const TOUCH_THRESHOLD = 120;
    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? 0;
      accRef.current = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (lockRef.current) return;
      const y = e.touches[0]?.clientY ?? 0;
      const delta = touchYRef.current - y; // +ve = pulling up = scroll-down intent
      touchYRef.current = y; // incremental, per move
      const atEdge = delta > 0 ? atBottom() : atTop();
      if (!atEdge) {
        accRef.current = 0;
        return;
      }
      accRef.current += delta;
      if (Math.abs(accRef.current) > TOUCH_THRESHOLD) advance(accRef.current);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [view, go]);

  const panels: Record<View, ReactNode> = { work, lab, about };
  const idx = ORDER.indexOf(view);
  const nextView = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
  const nextLabel = nextView ? TABS.find((t) => t.id === nextView)?.label : null;

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = ORDER.indexOf(view);
    let next: View | null = null;

    if (event.key === "ArrowRight") next = ORDER[(currentIndex + 1) % ORDER.length];
    if (event.key === "ArrowLeft") next = ORDER[(currentIndex - 1 + ORDER.length) % ORDER.length];
    if (event.key === "Home") next = ORDER[0];
    if (event.key === "End") next = ORDER[ORDER.length - 1];

    if (!next) return;

    event.preventDefault();
    go(next);
    requestAnimationFrame(() => document.getElementById(tabId(next))?.focus());
  };

  return (
    <>
      {/* sticky nav */}
      <nav 
        className="sticky top-0 z-50 border-b border-line-soft/70 bg-bg/95"
      >
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-3 sm:px-8">
          <button
            type="button"
            onClick={() => go("work")}
            className="font-mono text-[11px] tracking-[0.18em] text-fg-dim transition-colors hover:text-fg"
          >
            IM<span className="text-fg"> / </span>portfolio
          </button>

          <div aria-label="Portfolio sections" role="tablist" className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={tabId(t.id)}
                type="button"
                role="tab"
                aria-selected={view === t.id}
                aria-controls={view === t.id ? panelId(t.id) : undefined}
                tabIndex={view === t.id ? 0 : -1}
                onClick={() => go(t.id)}
                onKeyDown={onTabKeyDown}
                className={cn(
                  "relative rounded-md px-3 py-1 font-mono text-[12px] tracking-[0.02em] transition-colors",
                  view === t.id ? "text-fg" : "text-fg-dim hover:text-fg-muted",
                )}
              >
                {view === t.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-md border border-line bg-bg-2"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {t.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3 font-mono text-[11px] tracking-[0.04em] sm:gap-4">
            <a
              href="mailto:hello@ilyamoskovkin.com"
              className="hidden text-fg-dim transition-colors hover:text-fg sm:inline"
            >
              Email
            </a>
            <a
              href="/Ilya_Moskovkin_CV.pdf"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-line bg-bg-2 px-2.5 py-1 text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Résumé ↗
            </a>
            <div className="hidden items-center gap-2 text-[10px] lowercase text-fg-dim sm:flex">
              <span className="status-dot" />
              <span>ict {time}</span>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* sliding panels */}
      <div className="overflow-x-hidden">
        {instant ? (
          <div id={panelId(view)} role="tabpanel" aria-labelledby={tabId(view)} tabIndex={-1}>
            {panels[view]}
          </div>
        ) : (
          <AnimatePresence
            mode="wait"
            custom={{ dir, axis }}
            initial={false}
            onExitComplete={() => window.scrollTo({ top: 0, behavior: "auto" })}
          >
            <motion.div
              key={view}
              custom={{ dir, axis }}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: axis === "y" ? 0.4 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              id={panelId(view)}
              role="tabpanel"
              aria-labelledby={tabId(view)}
              tabIndex={-1}
            >
              {panels[view]}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* next-zone affordance — clickable, and signals the scroll-to-advance */}
      {nextView && (
        <div className="mx-auto -mt-6 max-w-[880px] px-5 pb-10 sm:px-8">
          <button
            type="button"
            onClick={() => go(nextView, { axis: "y" })}
            className="group flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-line-soft py-3 font-mono text-[11px] tracking-[0.08em] text-fg-dim transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Keep scrolling, or click, to open {nextLabel}
            <span className="inline-block transition-transform group-hover:translate-y-0.5">↓</span>
          </button>
        </div>
      )}
    </>
  );
}
