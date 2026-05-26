"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

/**
 * "back to work" link with two states:
 *  - inline at the top of the reading column (its natural place);
 *  - once that inline copy scrolls out of view, a compact pill slides into
 *    the top-left corner of the viewport and stays there.
 * On wide screens the corner pill lives in the left gutter, clear of the
 * centred column. On narrow screens it collapses to just the arrow with a
 * blurred backdrop so it never overlaps the article text.
 */
export function BackToWork() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* inline copy — also the sentinel that drives the stuck state.
          Sits at the container's left edge, in line with the header. */}
      <div ref={sentinelRef}>
        <Link
          href="/#work"
          className="group inline-flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim transition-colors hover:text-fg"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
          back to work
        </Link>
      </div>

      {/* corner copy — fixed, fades + slides in once the inline one is gone */}
      <AnimatePresence>
        {stuck && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-4 top-4 z-50 sm:left-6 sm:top-6"
          >
            <Link
              href="/#work"
              aria-label="back to work"
              className="group inline-flex items-center gap-2 rounded-full border border-line-soft bg-bg-2/70 px-3 py-1.5 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim shadow-sm backdrop-blur-md transition-colors hover:border-[color:color-mix(in_oklab,var(--accent)_30%,var(--line))] hover:text-fg"
            >
              <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
              <span className="hidden sm:inline">back to work</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
