"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Img = { src: string; label: string; alt: string };

/**
 * Two-image parallax composition that FILLS the stage frame edge to edge, so
 * the media reads at the same physical size as the Broker preview (no half-frame
 * columns, no empty padding).
 *
 * The long dashboard anchors the right two-thirds and scrolls slower; a taller
 * hero crop sits on the left third and drifts faster — the depth read comes
 * from the parallax speed difference, not from shrinking the images.
 *
 * Falls back to static under reduced-motion.
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
    <div ref={ref} className="relative h-full w-full">
      {/* tall hero crop — left third, flies faster, fills its lane top-to-bottom.
          No gap to the dashboard: the two images butt together edge-to-edge so
          the composition fills the whole frame, same physical size as Broker. */}
      <motion.div
        style={{ y: yHero }}
        className="absolute left-0 top-0 h-full w-[36%] overflow-hidden will-change-transform"
      >
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          sizes="(min-width: 1024px) 275px, 36vw"
          className="object-cover object-top"
        />
        <span className="absolute bottom-2 left-2 z-10 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9px] lowercase tracking-[0.06em] text-white/85 backdrop-blur">
          {hero.label}
        </span>
      </motion.div>

      {/* long dashboard — right two-thirds, drifts the opposite way, fills its lane.
          butts flush against the hero crop (left edge at 36%) so there's no seam. */}
      <motion.div
        style={{ y: yDash }}
        className="absolute right-0 top-0 h-full w-[64%] overflow-hidden will-change-transform"
      >
        <Image
          src={dashboard.src}
          alt={dashboard.alt}
          fill
          sizes="(min-width: 1024px) 520px, 65vw"
          className="object-cover object-top"
        />
        <span className="absolute bottom-2 left-2 z-10 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9px] lowercase tracking-[0.06em] text-white/85 backdrop-blur">
          {dashboard.label}
        </span>
      </motion.div>
    </div>
  );
}
