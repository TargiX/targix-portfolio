"use client";

import Image from "next/image";
import { useLightbox, type LightboxImage } from "@/components/lightbox";

const SCREENS = {
  hero: {
    src: "/work/phosphene/hero-section.jpeg",
    caption: "The public landing page now sells the consumer promise first: pick a curated outcome and generate without prompt struggle.",
  },
  graph: {
    src: "/work/phosphene/graph-builder.png",
    caption: "Graph mode is still there for advanced iteration: prompt ingredients become typed nodes, edges, zones, and an inspectable generation plan.",
  },
  feed: {
    src: "/work/phosphene/tote-feed.jpeg",
    caption: "Generated results stay connected to the prompt, model, actions, and expansion path instead of becoming disposable one-off images.",
  },
  template: {
    src: "/work/phosphene/template-builder.png",
    caption: "Template review is the main product loop: upload references, tweak guided fields, choose model settings, and generate.",
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
