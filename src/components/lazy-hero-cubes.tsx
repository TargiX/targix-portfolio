"use client";

import dynamic from "next/dynamic";

/**
 * Defers the three.js bundle (~150KB gzip) out of the initial page chunk. The
 * hero copy, poster grid, and stats are all DOM — the canvas fades in on its
 * own reveal animation, so a post-hydration mount is invisible.
 */
const HeroAsciiCubes = dynamic(
  () => import("@/components/hero/hero-ascii-cubes").then((m) => m.HeroAsciiCubes),
  { ssr: false },
);

export function LazyHeroCubes({ className }: { className?: string }) {
  return <HeroAsciiCubes className={className} />;
}
