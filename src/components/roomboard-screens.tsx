import Image from "next/image";

const SCREENS = {
  landing: {
    src: "/work/roomboard/landing-hero.png",
    aspect: "aspect-[16/9]",
    caption:
      "The landing page explains the product through the real object: a room, a shared board, and the promise of no-account visual collaboration.",
  },
  canvas: {
    src: "/work/roomboard/canvas-room.png",
    aspect: "aspect-[16/10]",
    caption:
      "The room surface combines Pixi-rendered cards and connectors with DOM controls for inspection, sharing, locking, comments, and uploads.",
  },
} as const;

type ScreenKey = keyof typeof SCREENS;

export function RoomboardScreen({ screen }: { screen: ScreenKey }) {
  const item = SCREENS[screen];

  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-md border border-line-soft bg-bg-2/40 shadow-2xl shadow-black/20">
        <div className={`relative ${item.aspect} bg-bg`}>
          <Image
            src={item.src}
            alt={`Roomboard product screenshot: ${screen}`}
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
