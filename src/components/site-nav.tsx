"use client";

import { useEffect, useRef, useState } from "react";
import { useVietnamTime } from "@/lib/use-vietnam-time";

const LINKS = [
  { id: "top", href: "#top", label: "Top" },
  { id: "work", href: "#work", label: "Work" },
  { id: "about", href: "#about", label: "About" },
];

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
  const [active, setActive] = useState<string>("top");
  const activeRef = useRef("top");

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const work = document.getElementById("work");
      const about = document.getElementById("about");
      const workTop = work?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const aboutTop = about?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;

      const next =
        aboutTop <= window.innerHeight * 0.82
          ? "about"
          : workTop <= window.innerHeight * 0.72
            ? "work"
            : "top";

      if (activeRef.current !== next) {
        activeRef.current = next;
        setActive(next);
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

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
                className={
                  "rounded-md px-2 py-1 font-mono text-[12px] tracking-[0.02em] transition-colors sm:px-3 " +
                  (isActive
                    ? "text-fg"
                    : "text-fg-dim hover:text-fg")
                }
              >
                {l.label}
              </a>
            );
          })}
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
          <div className="hidden items-center gap-2 text-[10px] lowercase text-fg-dim sm:flex">
            <span className="status-dot" />
            <span>ict {time}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
