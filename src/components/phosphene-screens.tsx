import Image from "next/image";

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

export function PhospheneScreen({ screen }: { screen: ScreenKey }) {
  const item = SCREENS[screen];

  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-md border border-line-soft bg-bg-2/40">
        <div className="relative aspect-[16/10] bg-bg">
          <Image
            src={item.src}
            alt={`Phosphene product screenshot: ${screen}`}
            fill
            sizes="(min-width: 760px) 760px, 100vw"
            className="object-cover object-top"
          />
        </div>
      </div>
      <figcaption className="mt-2 border-l border-line-soft pl-3 font-mono text-[11px] leading-relaxed text-fg-dim">
        {item.caption}
      </figcaption>
    </figure>
  );
}
