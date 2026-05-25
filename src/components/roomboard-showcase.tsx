import Image from "next/image";

export function RoomboardShowcase() {
  return (
    <div className="relative h-full overflow-hidden bg-[#090c11]">
      <Image
        src="/work/roomboard/canvas-room.png"
        alt="Roomboard realtime canvas"
        fill
        sizes="(min-width: 1024px) 620px, 100vw"
        className="scale-[1.08] object-cover object-[45%_36%] opacity-90 transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.12]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(80%_70%_at_54%_36%,transparent,rgba(9,12,17,0.4)_58%,rgba(9,12,17,0.88)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,12,17,0.08),rgba(9,12,17,0.72)_100%)]"
      />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-white/70 backdrop-blur-md">
        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
        live canvas
      </div>

      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-[#10151f]/82 p-3 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="font-sans text-[17px] font-medium tracking-[-0.02em] text-white">
            Roomboard
          </div>
          <div className="flex -space-x-1.5">
            {["M", "J", "T"].map((letter, index) => (
              <span
                key={letter}
                className="grid size-5 place-items-center rounded-full border border-[#10151f] font-mono text-[9px] font-bold text-white"
                style={{
                  background: ["#ff6b85", "#5ee0a4", "#a78bfa"][index],
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
        <p className="m-0 max-w-[36ch] text-[11px] leading-relaxed text-white/62">
          Link-based rooms for visual decisions: notes, images, comments, presence, and lockable
          realtime collaboration.
        </p>
      </div>
    </div>
  );
}
