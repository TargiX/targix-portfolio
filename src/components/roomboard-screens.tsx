"use client";

import Image from "next/image";
import { useLightbox, type LightboxImage } from "@/components/lightbox";

const SCREENS = {
  landing: {
    src: "/work/roomboard/landing-hero.png",
    aspect: "aspect-[16/9]",
    caption:
      "The landing page explains the product through the real object: a private room, a live board preview, and role-specific invite links.",
  },
  canvas: {
    src: "/work/roomboard/canvas-room.png",
    aspect: "aspect-[16/10]",
    caption:
      "The room surface combines Pixi-rendered cards and connectors with DOM controls for inspection, sharing, locking, comments, and uploads.",
  },
  editorial: {
    src: "/work/roomboard/landing-editorial.png",
    aspect: "aspect-[16/9]",
    caption:
      "The landing was rebuilt as a scroll-driven editorial piece — a pinned horizontal walkthrough, animated feature specimens, and a restrained serif-on-navy design system built with Framer Motion and Lenis.",
  },
} as const;

type ScreenKey = keyof typeof SCREENS;

const ORDER = Object.keys(SCREENS) as ScreenKey[];
const LB: LightboxImage[] = ORDER.map((k) => ({
  src: SCREENS[k].src,
  alt: `Roomboard — ${k}`,
  label: k,
}));

export function RoomboardScreen({ screen }: { screen: ScreenKey }) {
  const { open } = useLightbox();
  const item = SCREENS[screen];

  return (
    <figure className="my-10">
      <button
        type="button"
        onClick={() => open(LB, ORDER.indexOf(screen))}
        aria-label={`View ${screen} screenshot full screen`}
        className="group/shot block w-full cursor-zoom-in overflow-hidden rounded-md border border-line-soft bg-bg-2/40 shadow-2xl shadow-black/20 transition-colors hover:border-[color:color-mix(in_oklab,var(--accent)_35%,var(--line))]"
      >
        <div className={`relative ${item.aspect} bg-bg`}>
          <Image
            src={item.src}
            alt={`Roomboard product screenshot: ${screen}`}
            fill
            sizes="(min-width: 760px) 760px, 100vw"
            className="object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/shot:scale-[1.02]"
          />
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex size-6 items-center justify-center rounded bg-black/45 text-[12px] text-white/85 opacity-0 backdrop-blur transition-opacity duration-300 group-hover/shot:opacity-100"
          >
            ⤢
          </span>
        </div>
      </button>
      <figcaption className="mt-2 border-l border-line-soft pl-3 font-mono text-[11px] leading-relaxed text-fg-dim">
        {item.caption}
      </figcaption>
    </figure>
  );
}
