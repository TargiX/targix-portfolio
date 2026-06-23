"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// The platform screens cycle through this order: a wide establishing shot
// first, then the flow screens. One shown at a time; hover accelerates the
// cycle, so resting on the card flips through the product like a deck.
const SHOTS = [
  { src: "/work/broker/banner.webp", label: "platform" },
  { src: "/work/broker/table.webp", label: "quotes" },
  { src: "/work/broker/accounts.webp", label: "accounts" },
  { src: "/work/broker/panel.webp", label: "inspector" },
  { src: "/work/broker/sign-in.webp", label: "sign in" },
] as const;

/**
 * Single Broker preview that crossfades between shots. Default: a slow auto-loop
 * every ~2.4s so the card feels alive even unattended. On hover the loop speeds
 * up, so resting the cursor flips through the product flow. Falls back to the
 * first shot only (no JS timer churn) under reduced-motion.
 *
 * This replaces the old 5-lane parallax "wall", whose individual screens were
 * cropped into narrow unreadable strips — here each shot shows whole.
 */
export function BrokerPreview() {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce) return;
    const ms = hover ? 1100 : 2600; // faster flip while hovered
    const id = setInterval(() => setI((p) => (p + 1) % SHOTS.length), ms);
    return () => clearInterval(id);
  }, [hover, reduce]);

  const next = (i + 1) % SHOTS.length;

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {SHOTS.map((s, idx) => {
        // Keep only current + next mounted so the crossfade has its target but
        // we don't stack 5 heavy images. Others unmount after their turn.
        const active = idx === i || idx === next;
        const visible = idx === i;
        return (
          <Image
            key={s.src}
            src={s.src}
            alt={`Broker Online Exchange — ${s.label}`}
            fill
            sizes="(min-width: 1024px) 760px, 100vw"
            priority={idx === 0}
            className="object-cover object-top"
            style={{
              opacity: active ? (visible ? 1 : 0) : 0,
              transition: "opacity 700ms cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        );
      })}
      {/* shot counter + label */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
        <div className="flex gap-1">
          {SHOTS.map((_, idx) => (
            <span
              key={idx}
              className="h-1 rounded-full bg-white/70 transition-all duration-500"
              style={{ width: idx === i ? 18 : 6, opacity: idx === i ? 1 : 0.4 }}
            />
          ))}
        </div>
        <span className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9px] lowercase tracking-[0.08em] text-white/85 backdrop-blur">
          {SHOTS[i].label} · {i + 1}/{SHOTS.length}
        </span>
      </div>
    </div>
  );
}
