"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useVietnamTime } from "@/lib/use-vietnam-time";
import { cn } from "@/lib/utils";

type View = "work" | "lab" | "about";
const ORDER: View[] = ["work", "lab", "about"];

const TABS: { id: View; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "lab", label: "Lab" },
  { id: "about", label: "About" },
];

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
  const [dir, setDir] = useState(1);
  const [axis, setAxis] = useState<Axis>("x");
  const time = useVietnamTime();

  const lockRef = useRef(false);
  const accRef = useRef(0);
  const lastWheelRef = useRef(0);
  const touchYRef = useRef(0);

  const go = useCallback(
    (next: View, opts: { axis?: Axis; push?: boolean } = {}) => {
      const { axis: nextAxis = "x", push = true } = opts;
      setView((cur) => {
        if (cur === next) return cur;
        setDir(ORDER.indexOf(next) > ORDER.indexOf(cur) ? 1 : -1);
        setAxis(nextAxis);
        return next;
      });
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
      if (ORDER.includes(h)) go(h, { push: false });
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [go]);

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
        setTimeout(() => (lockRef.current = false), COOLDOWN);
        return true;
      }
      if (delta < 0 && atTop() && idx > 0) {
        lockRef.current = true;
        accRef.current = 0;
        go(ORDER[idx - 1], { axis: "y" });
        setTimeout(() => (lockRef.current = false), COOLDOWN);
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

    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (lockRef.current) return;
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchYRef.current - y; // +ve = swipe up = scroll-down intent
      const atEdge = dy > 0 ? atBottom() : atTop();
      if (atEdge && Math.abs(dy) > 70) advance(dy);
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

  return (
    <>
      {/* sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-line-soft/70 bg-bg/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-3 sm:px-8">
          <button
            type="button"
            onClick={() => go("work")}
            className="font-mono text-[11px] tracking-[0.18em] text-fg-dim transition-colors hover:text-fg"
          >
            IM<span className="text-fg"> / </span>portfolio
          </button>

          <div className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => go(t.id)}
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

          <div className="ml-auto hidden items-center gap-2 font-mono text-[10px] lowercase tracking-[0.04em] text-fg-dim sm:flex">
            <span className="status-dot" />
            <span>ict {time}</span>
          </div>
        </div>
      </nav>

      {/* sliding panels */}
      <div className="overflow-x-hidden">
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
          >
            {panels[view]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* next-zone affordance — clickable, and signals the scroll-to-advance */}
      {nextView && (
        <div className="mx-auto -mt-6 max-w-[880px] px-5 pb-10 sm:px-8">
          <button
            type="button"
            onClick={() => go(nextView, { axis: "y" })}
            className="group flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-line-soft py-3 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            keep scrolling for {nextLabel}
            <span className="inline-block transition-transform group-hover:translate-y-0.5">↓</span>
          </button>
        </div>
      )}
    </>
  );
}
