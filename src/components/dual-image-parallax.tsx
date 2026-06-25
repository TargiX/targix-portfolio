"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Img = { src: string; alt: string };

/**
 * Two floating product screens for SignalOps. They intentionally sit as
 * separate panels instead of being sliced into one frame: the cockpit proves
 * the product surface, while the landing page gives the first read a clearer
 * product/brand signal.
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
        className="absolute right-[-1%] top-[19%] h-[72%] w-[66%] overflow-hidden rounded-lg border border-white/12 bg-black/10 shadow-[0_28px_80px_rgba(2,8,12,0.28),0_10px_28px_rgba(2,8,12,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-black/10 will-change-transform"
      >
        <Image
          src={dashboard.src}
          alt={dashboard.alt}
          fill
          sizes="(min-width: 1024px) 560px, 72vw"
          className="object-cover object-top"
        />
      </motion.div>

      {/* front landing panel — wide, lifted left/up with a soft separation shadow */}
      <motion.div
        style={{ y: yHero }}
        className="absolute left-[0%] top-[-1%] z-20 h-[76%] w-[74%] overflow-hidden rounded-lg border border-white/16 bg-black/14 shadow-[26px_28px_70px_rgba(2,8,12,0.34),8px_10px_24px_rgba(2,8,12,0.2),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-black/10 will-change-transform"
      >
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          sizes="(min-width: 1024px) 540px, 70vw"
          className="object-cover object-top"
        />
      </motion.div>
    </div>
  );
}
