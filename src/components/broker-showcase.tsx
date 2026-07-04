"use client";

import Image from "next/image";
import { useLightbox, type LightboxImage } from "@/components/lightbox";

/** Card media: the isometric platform render. */
export function BrokerShowcase() {
  return (
    <div className="relative h-full overflow-hidden bg-[#1f9ed6] [perspective:900px]">
      <Image
        src="/work/broker/banner.webp"
        alt="MyServiceCloud platform — Broker Online Exchange"
        fill
        sizes="(min-width: 1024px) 620px, 100vw"
        className="work-card-media object-cover object-center"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_22px_54px_rgba(0,0,0,0.32),inset_0_-18px_42px_rgba(0,0,0,0.24)] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:opacity-100"
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

const LB: LightboxImage[] = SHOTS.map((s) => ({
  src: s.src,
  alt: `Broker Online Exchange — ${s.label}`,
  label: s.label,
}));

/** Case-study gallery: polished interface renders of the platform. */
export function BrokerShots() {
  const { open } = useLightbox();
  return (
    <figure className="my-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SHOTS.map((s, i) => (
          <button
            type="button"
            key={s.src}
            onClick={() => open(LB, i)}
            aria-label={`View ${s.label} full screen`}
            className="group/shot relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-md border border-line-soft bg-bg-3 transition-colors hover:border-[color:color-mix(in_oklab,var(--accent)_35%,var(--line))]"
          >
            <Image
              src={s.src}
              alt={`Broker Online Exchange — ${s.label}`}
              fill
              sizes="(min-width: 760px) 370px, 100vw"
              className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/shot:scale-[1.03]"
            />
            <span className="absolute bottom-2 left-2 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] lowercase tracking-[0.06em] text-white/80 backdrop-blur">
              {s.label}
            </span>
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 flex size-6 items-center justify-center rounded bg-black/45 text-[12px] text-white/85 opacity-0 backdrop-blur transition-opacity duration-300 group-hover/shot:opacity-100"
            >
              ⤢
            </span>
          </button>
        ))}
      </div>
      <figcaption className="mt-2 border-l border-line-soft pl-3 font-mono text-[11px] leading-relaxed text-fg-dim">
        The interface, screen by screen: sign-in, quoting tables, account modals, the inspector,
        and document upload. The design system was a studio collaboration; building it into the
        live, stateful React app was my team&apos;s frontend.
      </figcaption>
    </figure>
  );
}
