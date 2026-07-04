import Image from "next/image";

/**
 * A "fan" of app screens, splayed at angles like a hand of cards.
 * Universal media for mobile-style projects. The work stage moves the whole
 * fan gently on hover; individual screens stay calm.
 */
export function ScreenFan({ screens, alt }: { screens: string[]; alt: string }) {
  const list = screens.slice(0, 5);
  const n = list.length;
  const mid = (n - 1) / 2;

  return (
    <div className="absolute inset-0 flex items-end justify-center">
      {list.map((src, i) => {
        const off = i - mid;
        // rest position
        const rot = off * 8;
        const tx = off * 42;
        const ty = Math.abs(off) * 14;
        const z = n - Math.abs(Math.round(off));

        return (
          <div
            key={src}
            className="absolute -bottom-[14%] aspect-[9/19.5] w-[32%] overflow-hidden rounded-[14px] border border-white/10 bg-bg-2 shadow-2xl shadow-black/50 will-change-transform [transform:var(--t)]"
            style={
              {
                "--t": `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`,
                zIndex: z,
              } as React.CSSProperties
            }
          >
            <Image
              src={src}
              alt={`${alt} — screen ${i + 1}`}
              fill
              sizes="180px"
              className="object-cover object-top"
            />
          </div>
        );
      })}
    </div>
  );
}
