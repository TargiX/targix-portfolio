"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
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

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 90 : -90, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -90 : 90, opacity: 0 }),
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
  const time = useVietnamTime();

  const go = useCallback(
    (next: View, push = true) => {
      setView((cur) => {
        if (cur === next) return cur;
        setDir(ORDER.indexOf(next) > ORDER.indexOf(cur) ? 1 : -1);
        return next;
      });
      if (push && typeof window !== "undefined") {
        history.replaceState(null, "", `#${next}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [],
  );

  // sync with hash (so hero's "#lab" link + back/forward work)
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as View;
      if (ORDER.includes(h)) go(h, false);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [go]);

  const panels: Record<View, ReactNode> = { work, lab, about };

  return (
    <>
      {/* sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-line-soft/70 bg-bg/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-[880px] items-center gap-4 px-5 py-3 sm:px-8">
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
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={view}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {panels[view]}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
