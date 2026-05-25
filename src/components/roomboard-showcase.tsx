import Image from "next/image";

export function RoomboardShowcase() {
  return (
    <div className="relative h-full overflow-hidden bg-[#090c11]">
      <Image
        src="/work/roomboard/canvas-room.png"
        alt="Roomboard realtime canvas"
        fill
        sizes="(min-width: 1024px) 620px, 100vw"
        className="scale-[1.06] object-cover object-[45%_36%] transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.11]"
      />

      {/* subtle edge vignette only — the title + description live below the card */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(95%_85%_at_50%_40%,transparent,rgba(9,12,17,0.32)_88%)]"
      />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-white/70 backdrop-blur-md">
        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
        live canvas
      </div>
    </div>
  );
}
