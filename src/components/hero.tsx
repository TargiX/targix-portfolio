"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  FileText,
  Mail,
  Rocket,
  X,
} from "lucide-react";
import { HeroAsciiCubes } from "@/components/hero/hero-ascii-cubes";
import { CONTACT } from "@/lib/data";

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);

  return (
    <header
      ref={heroRef}
      className="hero-scroll-wrap relative"
      data-screen-label="00 Hero"
    >
      <div className="hero-shell relative isolate w-full overflow-hidden">
        <div aria-hidden="true" className="hero-bg absolute inset-0 z-0" />
        <HeroAsciiCubes className="absolute inset-0 z-[2]" />

        <HeroPosterGrid />
        <HeroCopy />
        <HeroPosterStats />
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
        <span className="hero-rail-copy">AI Systems</span>
      </div>

      <div className="hero-rail-note hero-rail-note--right hero-rail-note--visual">
        <span className="hero-rail-number">03</span>
        <span className="hero-rail-copy">Visual Systems</span>
      </div>
    </div>
  );
}

function HeroCopy() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <div className="hero-copy-shell relative z-10 grid w-full">
        <div className="hero-copy-inner">
          <div className="hero-sequence-note mb-20 hidden font-mono text-[9px] uppercase leading-relaxed text-fg-dim md:block">
            <span aria-hidden="true">↑</span> A1
            <br />
            00.00.00
          </div>

          <div className="mb-5 font-mono text-[15px] font-semibold uppercase tracking-[1.8px] text-fg-muted">
            SENIOR FRONT END DEVELOPER
          </div>

          <h1 className="m-0 max-w-[760px] font-sans text-[64px] font-light leading-[0.95] tracking-normal text-fg sm:text-[88px] md:text-[104px] md:leading-[111px] lg:text-[104px] xl:text-[116px] xl:leading-[122px]">
            Ilya
            <br />
            Moskovkin
          </h1>

          <div
            className="mx-[5px] my-[26px] h-[3px] w-[47px] rounded-full bg-[var(--accent)] shadow-[0_0_22px_color-mix(in_oklab,var(--accent)_42%,transparent)]"
            aria-hidden="true"
          />

          <p className="m-0 max-w-[780px] font-sans text-[32px] font-light leading-[1.18] tracking-normal text-fg sm:text-[36px]">
            I architect{" "}
            <span className="text-[var(--accent)]">
              scalable interfaces
            </span>
            <br className="hidden sm:block" />
            {" "}and ship AI-powered products.
          </p>

          <p className="mt-[18px] max-w-[510px] font-sans text-[20px] font-light leading-[1.55] text-fg-muted">
            From system design to polished UI - I turn complexity into products
            people rely on.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5 sm:gap-16">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="inline-flex h-14 items-center justify-center gap-5 rounded-sm bg-[var(--accent)] px-7 font-mono text-[15px] font-bold tracking-[0.04em] text-black shadow-[0_18px_42px_color-mix(in_oklab,var(--accent)_28%,transparent)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Me
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
            <a
              href="#work"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-sm px-1 font-mono text-[13px] font-semibold tracking-[0.05em] text-fg transition-colors hover:text-[var(--accent)] sm:text-[14px]"
            >
              View selected work
              <span className="text-fg-dim transition-colors group-hover:text-[var(--accent)]">
                ::
              </span>
            </a>
          </div>
        </div>
      </div>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

function HeroPosterStats() {
  return (
    <div className="hero-poster-stats absolute inset-x-0 bottom-0 z-20">
      <div className="hero-stat">
        <span className="hero-stat-token">10+</span>
        <span className="hero-stat-label">
          Years
          <br />
          Building
        </span>
      </div>
      <div className="hero-stat">
        <span className="hero-stat-token">15+</span>
        <span className="hero-stat-label">
          Shipped
          <br />
          Products
        </span>
      </div>
      <div className="hero-stat">
        <span className="hero-stat-orbit" aria-hidden="true">
          <Rocket className="size-7" />
        </span>
        <span className="hero-stat-label">
          AI Product
          <br />
          Launched
        </span>
      </div>
    </div>
  );
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const iconFor = (key: string) => {
    if (key === "email") return Mail;
    if (key === "github") return Code2;
    if (key === "linkedin") return BriefcaseBusiness;
    return FileText;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close contact menu"
        className="absolute inset-0 bg-black/78 backdrop-blur-lg"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contact links"
        className="relative w-full max-w-[420px] overflow-hidden rounded-lg border border-line-soft bg-bg p-4 shadow-2xl shadow-black/20"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
              contact
            </div>
            <div className="mt-1 font-sans text-[22px] font-medium tracking-[-0.02em] text-fg">
              Let&apos;s talk
            </div>
          </div>
          <button
            type="button"
            aria-label="Close contact menu"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-line-soft text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-2">
          {CONTACT.map((item) => {
            const Icon = iconFor(item.key);
            const external = /^https?:\/\//.test(item.href);
            return (
              <a
                key={item.key}
                href={item.href}
                target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group flex items-center gap-3 rounded-md border border-line-soft bg-bg-2/50 px-3 py-3 text-left transition-colors hover:border-[var(--accent)] hover:bg-bg-2"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-bg text-fg-muted transition-colors group-hover:text-[var(--accent)]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
                    {item.key}
                  </span>
                  <span className="block truncate text-[13px] text-fg">{item.label}</span>
                </span>
                {external && (
                  <ExternalLink className="size-3.5 shrink-0 text-fg-dim transition-colors group-hover:text-[var(--accent)]" aria-hidden="true" />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
