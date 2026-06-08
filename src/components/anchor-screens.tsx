"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";

/* ── Scrollytell ─────────────────────────────────────── */

const BEATS = [
  {
    id: "landing",
    img: "/work/anchor/landing.png",
    label: "Landing",
    heading: "A ritual, not a form",
    body: "The opening screen is the product promise: two rituals, no wall of inputs. Warm paper-and-ink tones and a single action set the tone before the first tap.",
  },
  {
    id: "dashboard",
    img: "/work/anchor/dashboard.png",
    label: "Dashboard",
    heading: "The streak as an anchor",
    body: "One number, two cards. The dashboard shows today's completion state and the running streak, the mechanism that makes skipping feel costly while staying gentle.",
  },
  {
    id: "sleep",
    img: "/work/anchor/sleep.png",
    label: "Morning ritual",
    heading: "Touch-first controls",
    body: "The sleep-quality slider is a Radix primitive reskinned to token. This is also the component behind the invisible-track bug, and the selector fix that earned its own paragraph in the write-up.",
  },
  {
    id: "evening",
    img: "/work/anchor/evening.png",
    label: "Evening ritual",
    heading: "Close the loop",
    body: "Mood, free journal, tomorrow's sleep window. The evening ritual reuses the same step-machine pattern as morning: different data shape, same interaction contract.",
  },
] as const;

export function AnchorScrollytell() {
  const [activeIndex, setActiveIndex] = useState(0);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Single source of truth: on scroll, the beat whose center sits closest to a
  // fixed focus line (≈42% down the viewport) is active. No competing observers,
  // so it never flickers or jumps two sections at once.
  useEffect(() => {
    let raf = 0;

    const recompute = () => {
      raf = 0;
      const focusY = window.innerHeight * 0.42;
      let bestIndex = 0;
      let bestDist = Infinity;
      for (let i = 0; i < beatRefs.current.length; i++) {
        const el = beatRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - focusY);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      }
      setActiveIndex((prev) => (prev === bestIndex ? prev : bestIndex));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(recompute);
    };

    recompute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const active = BEATS[activeIndex];

  return (
    <figure className="my-14 flex gap-8 sm:gap-10" aria-label="Anchor screens — scroll to explore">
      {/* Left: sticky phone — hidden on mobile */}
      <div className="sticky top-28 hidden flex-shrink-0 self-start sm:block">
        <div className="relative rounded-[2rem] border border-line bg-[oklch(0.16_0.006_250)] p-[9px] shadow-2xl shadow-black/50">
          <div className="absolute left-1/2 top-[9px] z-10 h-[14px] w-[96px] -translate-x-1/2 rounded-b-xl bg-[oklch(0.16_0.006_250)]" />
          <div className="relative h-[460px] w-[215px] overflow-hidden rounded-[1.6rem] bg-bg-2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={active.img}
                  alt={`Anchor — ${active.label}`}
                  fill
                  sizes="215px"
                  className="object-cover object-top"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex justify-center gap-2">
          {BEATS.map((b, i) => (
            <button
              key={b.id}
              aria-label={`Jump to ${b.label}`}
              onClick={() =>
                beatRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
              className={`h-[3px] rounded-full transition-[background-color,width] duration-300 ${
                i === activeIndex ? "w-5 bg-[var(--accent)]" : "w-[3px] bg-fg-dim/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right: scrolling beats */}
      <div className="flex flex-1 flex-col">
        {BEATS.map((beat, i) => (
          <div
            key={beat.id}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
            className="flex min-h-[280px] flex-col justify-center py-10"
          >
            {/* Mobile: inline screenshot */}
            <div className="mb-5 sm:hidden">
              <div className="relative aspect-[9/16] w-full max-w-[180px] overflow-hidden rounded-2xl border border-line-soft bg-bg-2">
                <Image
                  src={beat.img}
                  alt={`Anchor — ${beat.label}`}
                  fill
                  sizes="180px"
                  className="object-cover object-top"
                />
              </div>
            </div>

            <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--accent)]">
              {beat.label}
            </span>
            <h3
              className={`mb-3 font-sans text-[17px] font-medium leading-snug tracking-tight transition-colors duration-300 ${
                i === activeIndex ? "text-fg" : "text-fg-dim"
              }`}
            >
              {beat.heading}
            </h3>
            <p
              className={`text-[13.5px] leading-[1.7] transition-colors duration-300 ${
                i === activeIndex ? "text-fg-muted" : "text-fg-dim/50"
              }`}
            >
              {beat.body}
            </p>

            {i < BEATS.length - 1 && <div className="mt-8 h-px bg-line-soft" />}
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ── Parallax gallery ────────────────────────────────── */

// yRange: [y when entering viewport, y when leaving viewport] — midpoint is the "resting" position
const GALLERY = [
  { img: "/work/anchor/landing.png",   label: "Landing",        yRange: [ 80, -20] as [number,number], rotate: -3.5 },
  { img: "/work/anchor/dashboard.png", label: "Dashboard",      yRange: [-40,  40] as [number,number], rotate:  1.5 },
  { img: "/work/anchor/sleep.png",     label: "Morning ritual", yRange: [ 60, -10] as [number,number], rotate: -2   },
  { img: "/work/anchor/evening.png",   label: "Evening ritual", yRange: [-60,  20] as [number,number], rotate:  3   },
];

function ParallaxPhone({
  img,
  label,
  rotate,
  yRange,
  progress,
}: {
  img: string;
  label: string;
  rotate: number;
  yRange: [number, number];
  progress: MotionValue<number>;
}) {
  const y = useTransform(progress, [0, 1], yRange);

  return (
    <motion.div
      style={{ y, rotate }}
      className="flex-shrink-0"
    >
      <div className="relative rounded-[1.8rem] border border-line bg-[oklch(0.16_0.006_250)] p-[7px] shadow-2xl shadow-black/50">
        <div className="absolute left-1/2 top-[7px] z-10 h-[11px] w-[64px] -translate-x-1/2 rounded-b-lg bg-[oklch(0.16_0.006_250)]" />
        <div className="relative h-[340px] w-[155px] overflow-hidden rounded-[1.4rem] bg-bg-2">
          <Image
            src={img}
            alt={`Anchor — ${label}`}
            fill
            sizes="155px"
            className="object-cover object-top"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function AnchorParallaxGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <figure ref={ref} className="relative my-14 select-none overflow-hidden" aria-label="Anchor — all screens">
      {/* Fade edges so phones feel like they peek out */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent" />

      <div className="flex items-center justify-center gap-4 py-20">
        {GALLERY.map((phone) => (
          <ParallaxPhone
            key={phone.label}
            img={phone.img}
            label={phone.label}
            rotate={phone.rotate}
            yRange={phone.yRange}
            progress={scrollYProgress}
          />
        ))}
      </div>

      <figcaption className="mt-1 text-center font-mono text-[10px] lowercase tracking-[0.08em] text-fg-dim">
        landing · dashboard · morning · evening · one codebase, all screens
      </figcaption>
    </figure>
  );
}
