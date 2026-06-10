"use client";

import Image from "next/image";
import { useLightbox, type LightboxImage } from "@/components/lightbox";

const SCREENS = {
  hero: {
    src: "/work/phosphene/cyber-oasis-hero.jpeg",
    caption: "The public landing page frames the core idea: draw structure first, let the system write the prompt.",
  },
  graph: {
    src: "/work/phosphene/graph-builder.png",
    caption: "Graph mode turns prompt ingredients into typed nodes, edges, zones, and an inspectable generation plan.",
  },
  feed: {
    src: "/work/phosphene/tote-feed.jpeg",
    caption: "Feed mode keeps each generated result connected to its prompt, model, actions, and graph expansion path.",
  },
  template: {
    src: "/work/phosphene/template-builder.png",
    caption: "Templates make repeatable creative workflows feel like a guided product surface instead of a blank prompt box.",
  },
} as const;

type ScreenKey = keyof typeof SCREENS;

const ORDER = Object.keys(SCREENS) as ScreenKey[];
const LB: LightboxImage[] = ORDER.map((k) => ({
  src: SCREENS[k].src,
  alt: `Phosphene — ${k}`,
  label: k,
}));

export function PhospheneScreen({ screen }: { screen: ScreenKey }) {
  const { open } = useLightbox();
  const item = SCREENS[screen];

  return (
    <figure className="my-10">
      <button
        type="button"
        onClick={() => open(LB, ORDER.indexOf(screen))}
        aria-label={`View ${screen} screenshot full screen`}
        className="group/shot block w-full cursor-zoom-in overflow-hidden rounded-md border border-line-soft bg-bg-2/40 transition-colors hover:border-[color:color-mix(in_oklab,var(--accent)_35%,var(--line))]"
      >
        <div className="relative aspect-[16/10] bg-bg">
          <Image
            src={item.src}
            alt={`Phosphene product screenshot: ${screen}`}
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
