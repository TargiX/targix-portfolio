import Image from "next/image";

export function RoomboardShowcase() {
  return (
    <div className="relative h-full overflow-hidden bg-[#090c11]">
      <Image
        src="/work/roomboard/landing-hero.png"
        alt="Roomboard landing preview"
        fill
        sizes="(min-width: 1280px) 920px, (min-width: 1024px) 820px, 100vw"
        quality={95}
        className="object-cover object-top"
      />

      {/* subtle edge vignette only — the title + description live below the card */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(95%_85%_at_50%_40%,transparent,rgba(9,12,17,0.32)_88%)]"
      />
    </div>
  );
}
