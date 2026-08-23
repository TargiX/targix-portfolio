"use client";

import { FileText } from "lucide-react";

import { useVietnamTime } from "@/lib/use-vietnam-time";
import { SECTION_SEQUENCE, useActiveSection } from "@/lib/use-active-section";

const LINKS = SECTION_SEQUENCE.map((section) => ({
  id: section.id,
  href: `#${section.id}`,
  label: section.shortLabel,
}));

/**
 * Sticky header — the quiet version of the old ViewSwitcher. No tabs, no
 * overscroll-to-advance, no hash-routed panel swapping: just anchor links that
 * smooth-scroll to the named zones on a single continuous page. The logo
 * scrolls back to top.
 *
 * Scroll-spy marks the matching link active (accent color), so the user always
 * knows where they are on the page — the cue the old tabbed nav gave for free.
 */
export function SiteNav() {
  const time = useVietnamTime();
  const active = useActiveSection();

  return (
    <nav className="sticky top-0 z-[120] border-b border-line-soft/60 bg-[color-mix(in_oklab,var(--nav-bg)_88%,transparent)] shadow-[0_12px_30px_rgb(0_0_0_/_0.12)]">
      <div className="flex w-full items-center gap-5 overflow-visible px-5 py-3 sm:gap-7 sm:px-8">
        <a
          href="#top"
          className={
            "shrink-0 font-mono text-[18px] leading-none tracking-[0.02em] text-fg transition-colors hover:text-[var(--accent)]"
          }
        >
          IM
        </a>

        <div className="hidden h-6 w-px bg-line-soft/70 sm:block" aria-hidden />

        <div className="hidden items-center gap-2 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim sm:flex">
          <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_55%,transparent)]" />
          portfolio
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:ml-5">
          {LINKS.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive ? "true" : undefined}
                data-active={isActive ? "true" : undefined}
                className={l.id === "top" ? "site-nav-link site-nav-link--top" : "site-nav-link"}
              >
                {l.label}
              </a>
            );
          })}
          <a href="/proof" className="site-nav-link">
            Proof
          </a>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.04em] sm:gap-4">
          <a
            href="mailto:hello@ilyamoskovkin.com"
            className="hidden text-fg-dim transition-colors hover:text-fg sm:inline"
          >
            Email
          </a>
          <a
            href="/Ilya_Moskovkin_CV.pdf"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-md border border-white/14 bg-white/[0.035] px-3 py-1.5 text-fg-muted shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-flex"
          >
            Résumé ↗
          </a>
          <a
            href="/Ilya_Moskovkin_CV.pdf"
            target="_blank"
            rel="noreferrer"
            aria-label="Open résumé"
            title="Open résumé"
            className="grid size-8 place-items-center rounded-md border border-line-soft text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:hidden"
          >
            <FileText className="size-4" aria-hidden="true" />
          </a>
          <div className="hidden items-center gap-2 text-[10px] lowercase text-fg-dim sm:flex">
            <span className="status-dot" />
            <span>ict {time}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
