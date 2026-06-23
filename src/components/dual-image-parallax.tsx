"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Img = { src: string; label: string; alt: string };

/**
 * Two floating product screens for SignalOps. They intentionally sit as
 * separate panels instead of being sliced into one frame: the cockpit anchors
 * the back plane, while the incident detail lifts forward and slightly higher.
 */
export function DualImageParallax({ hero, dashboard }: { hero: Img; dashboard: Img }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yHero = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [22, -22]);
  const yDash = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-14, 14]);

  return (
    <div ref={ref} className="relative h-full w-full overflow-visible">
      <div
        aria-hidden
        className="absolute inset-[8%] rounded-[28px] bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.13),transparent_42%)]"
      />

      {/* back cockpit panel — lower/right, broad and calm */}
      <motion.div
        style={{ y: yDash }}
        className="absolute right-[3%] top-[13%] h-[74%] w-[70%] overflow-hidden rounded-lg border border-white/12 bg-black/10 shadow-[0_28px_80px_rgba(2,8,12,0.28),0_10px_28px_rgba(2,8,12,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-black/10 will-change-transform"
      >
        <Image
          src={dashboard.src}
          alt={dashboard.alt}
          fill
          sizes="(min-width: 1024px) 560px, 72vw"
          className="object-cover object-top"
        />
        <span className="absolute bottom-2 right-2 z-10 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] lowercase tracking-[0.06em] text-white/80 backdrop-blur">
          {dashboard.label}
        </span>
      </motion.div>

      {/* front incident panel — lifted left/up with a soft separation shadow */}
      <motion.div
        style={{ y: yHero }}
        className="absolute left-[3%] top-[5%] z-20 h-[82%] w-[44%] overflow-hidden rounded-lg border border-white/16 bg-black/14 shadow-[26px_28px_70px_rgba(2,8,12,0.34),8px_10px_24px_rgba(2,8,12,0.2),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-black/10 will-change-transform"
      >
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          sizes="(min-width: 1024px) 350px, 48vw"
          className="object-cover object-top"
        />
        <span className="absolute bottom-2 left-2 z-10 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9px] lowercase tracking-[0.06em] text-white/85 backdrop-blur">
          {hero.label}
        </span>
      </motion.div>
    </div>
  );
}
