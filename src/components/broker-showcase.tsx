import Image from "next/image";

/** Card media: the isometric platform render. */
export function BrokerShowcase() {
  return (
    <div className="relative h-full overflow-hidden bg-[#1f9ed6]">
      <Image
        src="/work/broker/banner.webp"
        alt="MyServiceCloud platform — Broker Online Exchange"
        fill
        sizes="(min-width: 1024px) 620px, 100vw"
        className="scale-[1.02] object-cover object-center transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.07]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(95%_85%_at_50%_45%,transparent,rgba(12,40,64,0.28)_92%)]"
      />
    </div>
  );
}

const SHOTS: { src: string; label: string }[] = [
  { src: "/work/broker/sign-in.webp", label: "Sign in" },
  { src: "/work/broker/table.webp", label: "Quotes table" },
  { src: "/work/broker/accounts.webp", label: "Accounts" },
  { src: "/work/broker/panel.webp", label: "Inspector panel" },
  { src: "/work/broker/upload-document.webp", label: "Document upload" },
];

/** Case-study gallery: polished interface renders of the platform. */
export function BrokerShots() {
  return (
    <figure className="my-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SHOTS.map((s) => (
          <div
            key={s.src}
            className="relative aspect-[4/3] overflow-hidden rounded-md border border-line-soft bg-bg-3"
          >
            <Image
              src={s.src}
              alt={`Broker Online Exchange — ${s.label}`}
              fill
              sizes="(min-width: 760px) 370px, 100vw"
              className="object-contain"
            />
            <span className="absolute bottom-2 left-2 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] lowercase tracking-[0.06em] text-white/80 backdrop-blur">
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 border-l border-line-soft pl-3 font-mono text-[11px] leading-relaxed text-fg-dim">
        The interface, screen by screen — sign-in, quoting tables, account modals, the inspector,
        and document upload. The design system was a studio collaboration; building it into the
        live, stateful React app was my team&apos;s frontend.
      </figcaption>
    </figure>
  );
}
