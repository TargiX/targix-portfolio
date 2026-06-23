"use client";

import { useMemo } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Fills the empty gutters around a WorkStage on very wide screens. Three cheap
 * CSS-driven layers, all paused off-tab and disabled under reduced-motion:
 *
 *  - grid: dot intersections, masked only at the top/bottom edges.
 *  - blobs: two soft color glows — one in each of the work's two hues — so the
 *    backdrop reads as a two-color gradient, not a flat tint. Slow drift.
 *  - dust: a handful of slow-twinkling specks for the premium-SaaS texture.
 *
 * Everything is `pointer-events-none` and `aria-hidden`; it's pure decoration.
 *
 * `hue`  — primary oklch hue (degrees) for this work.
 * `hue2` — secondary hue; the second blob + half the dust take this color.
 * `flip` — mirrors the blob layout to match the media side.
 */
export function StageBackdrop({
  hue,
  hue2,
  flip,
}: {
  hue: number;
  hue2: number;
  flip: boolean;
}) {
  const reduce = useReducedMotion();

  // Deterministic-ish random specks, stable across renders so they don't jump.
  // Alternate specks take hue vs hue2 so the dust carries both colors.
  const dust = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const left = (i * 67 + 13) % 100;
        const top = (i * 41 + 29) % 100;
        const delay = (i * 1.3) % 8;
        const dur = 9 + ((i * 7) % 7);
        const o = 0.25 + ((i * 13) % 40) / 100; // 0.25–0.65
        const useSecond = i % 2 === 1;
        return { left, top, delay, dur, o, i, useSecond };
      }),
    [],
  );

  // Two color stops for the dots — alternating per cell so the grid "shimmers"
  // between the work's primary and secondary hue as your eye moves across it.
  // Brighter than the old single --fg tint so the dots read clearly through the
  // ambient glow, instead of vanishing behind it.
  const c1 = `oklch(0.74 0.14 ${hue})`;
  const c2 = `oklch(0.70 0.12 ${hue2})`;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* primary blob (background layer) */}
      <div
        className="stage-blob"
        style={{
          background: c1,
          width: "42vw",
          height: "42vw",
          maxWidth: 620,
          maxHeight: 620,
          left: flip ? "58%" : "8%",
          top: "12%",
          animationDelay: "0s",
        }}
      />
      {/* secondary blob — different hue, opposite corner */}
      <div
        className="stage-blob"
        style={{
          background: c2,
          width: "34vw",
          height: "34vw",
          maxWidth: 500,
          maxHeight: 500,
          right: flip ? "10%" : "52%",
          bottom: "8%",
          animationDelay: "-9s",
        }}
      />

      {/* two-hue dot grid ON TOP of the blobs so the intersections shimmer
          through the color wash instead of being buried under it. */}
      <div
        className="stage-grid absolute inset-0"
        style={
          {
            "--stage-dot-primary": c1,
            "--stage-dot-secondary": c2,
            "--stage-grid-primary": flip ? "72% 30%" : "28% 30%",
            "--stage-grid-secondary": flip ? "25% 70%" : "70% 70%",
          } as React.CSSProperties
        }
      />

      {/* dust specks — half in each hue */}
      {!reduce &&
        dust.map((d) => (
          <span
            key={d.i}
            className="stage-dust"
            style={
              {
                left: `${d.left}%`,
                top: `${d.top}%`,
                color: d.useSecond ? c2 : c1,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.dur}s`,
                "--dust-o": d.o,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}
