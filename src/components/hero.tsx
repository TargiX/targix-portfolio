import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, FileText, Mail } from "lucide-react";

const EMAIL_HREF =
  "mailto:hello@ilyamoskovkin.com?subject=Senior%20frontend%20or%20design-engineering%20role";

const EVIDENCE = [
  {
    title: "Broker Online Exchange",
    label: "Production SaaS · Lead frontend · 2021–2026",
    note: "Five years of product ownership through an AppDirect acquisition.",
    href: "/work/broker-online-exchange",
    image: "/work/broker/accounts.webp",
  },
  {
    title: "Phosphene",
    label: "Founder-led AI product",
    note: "Product, design, frontend, backend, billing, and operations.",
    href: "/work/phosphene",
    image: "/work/phosphene/phosphene-landing-showcase.jpg",
  },
  {
    title: "Roomboard",
    label: "Independent collaboration product",
    note: "Realtime roles, review states, comments, and canvas UX.",
    href: "/work/roomboard",
    image: "/work/roomboard/canvas-room.png",
  },
] as const;

export function Hero() {
  return (
    <header className="hero-scroll-wrap relative" data-screen-label="00 Hero">
      <div className="hero-shell relative isolate w-full overflow-hidden">
        <div aria-hidden="true" className="hero-bg absolute inset-0 z-0" />
        <HeroPosterGrid />

        <div className="hero-copy-shell relative z-10 grid w-full">
          <HeroCopy />
          <HeroEvidenceReel />
        </div>

        <HeroProofStrip />
      </div>
    </header>
  );
}

function HeroPosterGrid() {
  return (
    <div className="hero-poster-grid absolute inset-0 z-[3]" aria-hidden="true">
      <span className="hero-grid-line hero-grid-line--split" />
      <span className="hero-grid-line hero-grid-line--right" />
      <span className="hero-grid-line hero-grid-line--bottom" />
      <span className="hero-grid-line hero-grid-line--mid" />
      <span className="hero-grid-cross hero-grid-cross--top" />
      <span className="hero-grid-cross hero-grid-cross--mid" />
      <span className="hero-grid-cross hero-grid-cross--bottom" />

      <div className="hero-rail-note hero-rail-note--left">
        <span className="hero-rail-number">01</span>
        <span className="hero-rail-copy">Introduction</span>
      </div>

      <div className="hero-rail-note hero-rail-note--right hero-rail-note--systems">
        <span className="hero-rail-number">02</span>
        <span className="hero-rail-copy">Production</span>
      </div>

      <div className="hero-rail-note hero-rail-note--right hero-rail-note--visual">
        <span className="hero-rail-number">03</span>
        <span className="hero-rail-copy">Products</span>
      </div>
    </div>
  );
}

function HeroCopy() {
  return (
    <div className="hero-copy-inner">
      <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted sm:text-[12px]">
        Senior frontend &amp; design engineer
      </div>

      <h1 className="m-0 max-w-[660px] font-sans text-[58px] font-light leading-[0.94] tracking-normal text-fg sm:text-[74px] md:text-[82px] lg:text-[88px] xl:text-[96px]">
        Ilya
        <br />
        Moskovkin
      </h1>

      <div
        className="my-5 h-[3px] w-[47px] rounded-full bg-[var(--accent)] shadow-[0_0_22px_color-mix(in_oklab,var(--accent)_42%,transparent)] sm:my-6"
        aria-hidden="true"
      />

      <p className="m-0 max-w-[620px] font-sans text-[25px] font-light leading-[1.2] tracking-normal text-fg sm:text-[30px]">
        I lead complex product interfaces from ambiguous brief to{" "}
        <span className="text-[var(--accent)]">shipped system.</span>
      </p>

      <p className="mt-4 max-w-[570px] font-sans text-[15px] leading-[1.65] text-fg-muted sm:text-[17px]">
        10+ years in frontend. Nearly five years leading a production B2B platform through
        acquisition. Now building SaaS and AI workflows across Vue and React.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={EMAIL_HREF}
          className="inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-[var(--accent)] px-5 font-mono text-[13px] font-bold tracking-[0.04em] text-black shadow-[0_16px_36px_color-mix(in_oklab,var(--accent)_24%,transparent)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Mail className="size-4" aria-hidden="true" />
          Email Ilya
        </a>
        <a
          href="/Ilya_Moskovkin_CV.pdf"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-line px-4 font-mono text-[12px] font-semibold tracking-[0.04em] text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <FileText className="size-4" aria-hidden="true" />
          Résumé
        </a>
        <a
          href="#work"
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-sm px-2 font-mono text-[12px] font-semibold tracking-[0.04em] text-fg-muted transition-colors hover:text-[var(--accent)]"
        >
          Selected work
          <ArrowDownRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-5 flex items-center gap-2 font-mono text-[10px] lowercase tracking-[0.08em] text-fg-dim">
        <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_color-mix(in_oklab,var(--accent)_55%,transparent)]" />
        available now · remote from Vietnam · UTC+7
      </div>
    </div>
  );
}

function HeroEvidenceReel() {
  const [primary, ...secondary] = EVIDENCE;

  return (
    <aside className="hero-evidence" aria-label="Selected product evidence">
      <div className="hero-evidence-heading">
        <span>Selected evidence</span>
        <span>production / founder / independent</span>
      </div>

      <Link href={primary.href} className="hero-evidence-primary group">
        <Image
          src={primary.image}
          alt={`${primary.title} product interface`}
          fill
          priority
          sizes="(min-width: 1024px) 42vw, 0px"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.025]"
        />
        <span className="hero-evidence-shade" aria-hidden="true" />
        <span className="hero-evidence-copy">
          <span className="hero-evidence-label">{primary.label}</span>
          <strong>{primary.title}</strong>
          <span>{primary.note}</span>
        </span>
        <ArrowRight className="hero-evidence-arrow" aria-hidden="true" />
      </Link>

      <div className="hero-evidence-secondary-grid">
        {secondary.map((item) => (
          <Link key={item.title} href={item.href} className="hero-evidence-secondary group">
            <Image
              src={item.image}
              alt={`${item.title} product interface`}
              fill
              sizes="(min-width: 1024px) 21vw, 0px"
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            />
            <span className="hero-evidence-shade" aria-hidden="true" />
            <span className="hero-evidence-copy">
              <span className="hero-evidence-label">{item.label}</span>
              <strong>{item.title}</strong>
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function HeroProofStrip() {
  return (
    <div className="hero-poster-stats z-20">
      {[
        ["10+", "Years", "in production"],
        ["5", "Years", "frontend lead"],
        ["1", "Founder-led", "AI product"],
      ].map(([value, lineOne, lineTwo]) => (
        <div key={`${lineOne}-${lineTwo}`} className="hero-stat">
          <span className="hero-stat-token">{value}</span>
          <span className="hero-stat-label">
            {lineOne}
            <br />
            {lineTwo}
          </span>
        </div>
      ))}
    </div>
  );
}
