"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ScreenFan } from "@/components/screen-fan";
import { PhospheneShowcase } from "@/components/phosphene-showcase";
import { RoomboardShowcase } from "@/components/roomboard-showcase";

const cardVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -4, transition: { type: "spring", stiffness: 220, damping: 24, mass: 0.6 } },
};

const underlineVariants: Variants = {
  rest: { scaleX: 0 },
  hover: { scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function ProjectCard({
  project,
  className,
  order = 0,
}: {
  project: Project;
  className?: string;
  order?: number;
}) {
  const { index, year, role, title, blurb, tags, links, caseSlug, screens, thumb, demo } =
    project;
  const href = caseSlug ? `/work/${caseSlug}` : undefined;
  const fan = screens && screens.length > 0 ? screens : thumb ? [thumb] : null;

  // "Laid on a table" reveal via IntersectionObserver + CSS transition.
  // (motion's whileInView/initial doesn't apply reliably in this Next 16 /
  // React 19 / React-Compiler setup, so we drive it with plain CSS.)
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const col = order % 2;
  // left column lands first, right a touch later; rows cascade
  const delay = Math.floor(order / 2) * 0.14 + col * 0.1;
  const tilt = col === 0 ? -2.5 : 2.5;

  return (
    <div ref={ref} className={cn("h-full [perspective:1000px]", className)}>
      <div
        className="h-full will-change-transform"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown
            ? "none"
            : `translateY(46px) rotateX(-16deg) rotateZ(${tilt}deg) scale(0.96)`,
          transition:
            "opacity 0.72s cubic-bezier(0.22,1,0.36,1), transform 0.72s cubic-bezier(0.22,1,0.36,1)",
          transitionDelay: `${delay}s`,
        }}
      >
      <motion.article
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={cardVariants}
        className={cn(
          "group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-line-soft bg-bg-2/30 transition-colors duration-300 hover:border-[color:color-mix(in_oklab,var(--accent)_30%,var(--line))]",
          href && "cursor-pointer",
        )}
      >
      {/* Media stage (static showcase images — the whole card is the link) */}
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-2">
          {/* gradient backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 [background:radial-gradient(120%_110%_at_50%_-10%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%),linear-gradient(180deg,oklch(0.2_0.006_250),oklch(0.16_0.006_250))]"
          />
          {/* dot grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,color-mix(in_oklab,var(--accent)_22%,transparent)_1px,transparent_1.5px)] [background-size:20px_20px]"
          />

          {demo === "phosphene" ? (
            <div className="absolute inset-0">
              <PhospheneShowcase />
            </div>
          ) : demo === "roomboard" ? (
            <div className="absolute inset-0">
              <RoomboardShowcase />
            </div>
          ) : fan ? (
            <ScreenFan screens={fan} alt={title} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-sans text-[64px] font-medium tracking-[-0.03em] text-white/12">
                {title.charAt(0)}
              </span>
            </div>
          )}

          {/* top-left index chip */}
          <span className="absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-white/70 backdrop-blur">
            {index} · {year}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1.5 text-[11px] lowercase tracking-[0.06em] text-fg-muted">{role}</div>

        <div className="mb-2 inline-block self-start">
          <h3 className="m-0 font-sans text-[22px] font-medium tracking-[-0.015em] text-fg transition-colors duration-300 group-hover/card:text-[color:var(--accent)]">
            {title}
          </h3>
          <motion.span
            variants={underlineVariants}
            className="block h-[2px] origin-left rounded-full bg-[var(--accent)] will-change-transform"
          />
        </div>

        <p className="mb-4 text-[13px] leading-[1.6] text-fg-muted transition-colors duration-500 group-hover/card:text-fg">
          {blurb}
        </p>

        {tags?.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li
                key={t}
                className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[11px] text-fg-muted transition-colors duration-300 group-hover/card:border-[color:color-mix(in_oklab,var(--accent)_30%,var(--line))]"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        {links?.length > 0 && (
          <div className="relative z-20 mt-auto flex flex-wrap gap-x-4 gap-y-2 self-start pt-1 text-xs">
            {links.map((l) => {
              const isExternal = /^https?:\/\//.test(l.href);
              const arrow = isExternal ? "↗" : "→";
              const cls =
                "group/link whitespace-nowrap border-b border-line pb-0.5 text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]";
              const inner = (
                <>
                  {l.label}
                  <span className="ml-1 inline-block transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
                    {arrow}
                  </span>
                </>
              );
              return isExternal ? (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link key={l.label} href={l.href} className={cls} prefetch>
                  {inner}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Stretched link — clicking anywhere on the card opens the case study.
          Footer links sit at z-20 so they stay independently clickable. */}
      {href && (
        <Link
          href={href}
          prefetch
          aria-label={`${title} — open case study`}
          className="absolute inset-0 z-10"
        />
      )}
      </motion.article>
      </div>
    </div>
  );
}
