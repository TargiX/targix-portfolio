"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ScreenFan } from "@/components/screen-fan";
import { Reveal } from "@/components/reveal";
import { BrokerPreview } from "@/components/broker-preview";
import { DualImageParallax } from "@/components/dual-image-parallax";
import { StageBackdrop } from "@/components/stage-backdrop";

const PhospheneShowcase = dynamic(
  () => import("@/components/phosphene-showcase").then((m) => m.PhospheneShowcase),
  { ssr: false },
);
const RoomboardShowcase = dynamic(
  () => import("@/components/roomboard-showcase").then((m) => m.RoomboardShowcase),
  { ssr: false },
);

// Per-work ambient theme. Each stage wears a two-hue identity (primary +
// secondary) so the glow reads as a rich gradient, not a flat single color.
// Hue values are in degrees (oklch L C H). The two blobs in the backdrop take
// the two hues, and the media frame border + index mark blend them.
type Theme = { primary: number; secondary: number; name: string };

const WORK_THEME: Record<string, Theme> = {
  // Broker brand blue flowing into a teal-green — the "blue↔green" you liked.
  "broker-online-exchange": { primary: 230, secondary: 185, name: "blue→teal" },
  // SignalOps: deep green shifting to teal (ops + signal colors).
  signalops: { primary: 160, secondary: 195, name: "green→teal" },
  // Phosphene: violet into magenta — neural-glow richness instead of flat purple.
  phosphene: { primary: 295, secondary: 330, name: "violet→magenta" },
  // Roomboard: canvas amber warmed with a coral shift.
  roomboard: { primary: 38, secondary: 18, name: "amber→coral" },
  // Anchor: emerald green into a cooler teal — calm + steady.
  anchor: { primary: 150, secondary: 178, name: "emerald→teal" },
};

const accent = (hue: number, lightness = 0.72, chroma = 0.16, alpha = 1) =>
  alpha < 1
    ? `oklch(${lightness} ${chroma} ${hue} / ${alpha})`
    : `oklch(${lightness} ${chroma} ${hue})`;

/**
 * One featured project as a full-screen scroll-snap stage.
 *
 * Layout: media dominates the left ~64% of the row, a narrow text column sits
 * to the right; BOTH are pinned to the top of the row on the same baseline so
 * the title reads next to the top of the screenshot, not stranded at the
 * bottom. Media flips sides each item for rhythm.
 *
 * Media dispatch mirrors the home-card logic but leans into per-project
 * compositions: Broker gets a 5-shot parallax wall, SignalOps gets a hero +
 * long-dashboard pair, the live demos (Phosphene/Roomboard) keep their
 * interactive showcases, Anchor keeps its ScreenFan.
 */
export function WorkStage({ project, index }: { project: Project; index: number }) {
  const { index: mark, year, role, title, blurb, tags, links, caseSlug, screens, thumb, demo } =
    project;
  const href = caseSlug ? `/work/${caseSlug}` : undefined;
  const fan = screens && screens.length > 0 ? screens : null;
  const imagePreview = thumb ?? null;
  const flip = index % 2 === 1; // alternate sides for visual rhythm
  const reduce = useReducedMotion();

  // Per-work color identity — drives the ambient glow, chip accent and the
  // media backdrop. Two hues blend into a gradient (primary → secondary).
  const theme = (caseSlug && WORK_THEME[caseSlug]) || {
    primary: 145,
    secondary: 178,
    name: "accent",
  };
  const { primary: hue, secondary: hue2 } = theme;

  // One consistent media aspect across all stages — no per-index variation.
  // (An earlier version alternated 16/12 vs 16/10 and offset the media up/down,
  // which read as "different preview sizes" rather than rhythm.) Only the side
  // flips, so the eye gets left/right variation without the frame resizing.
  const mediaAspect = "16/10";

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Gentle whole-stage drift to tie media to scroll; kept small (±6px) because
  // larger ranges compound with snap-parking and read as jitter. Identity under
  // reduced-motion.
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [6, -6]);

  const isBroker = demo === "broker";
  const isSignalOps = caseSlug === "signalops";
  const isPhosphene = demo === "phosphene";
  const isRoomboard = demo === "roomboard";

  return (
    <section
      ref={sectionRef}
      id={caseSlug}
      data-work-stage
      data-screen-label={`0${index + 1} ${title}`}
      className="work-stage relative flex min-h-[100svh] items-center"
    >
      {/* ambient per-work glow — subtle, two hues fading into the bg. Kept
         quiet on purpose: the hero is calm and restrained, so the stages stay
         in the same register — a whisper of color, not a wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(60% 55% at ${flip ? "72%" : "28%"} 30%, ${accent(hue, 0.55, 0.10, 0.09)}, transparent 60%), radial-gradient(55% 50% at ${flip ? "25%" : "70%"} 70%, ${accent(hue2, 0.5, 0.09, 0.07)}, transparent 58%)`,
        }}
      />
      {/* fills the empty gutters on wide screens: grid ring, color blobs, dust */}
      <StageBackdrop hue={hue} hue2={hue2} flip={flip} />

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-stretch gap-8 px-5 py-20 sm:gap-12 sm:px-8 lg:grid-cols-12 lg:py-24">
        {/* ── Media (left or right) ───────────────────────── */}
        <div
          className={cn(
            "relative",
            flip ? "lg:order-2 lg:col-start-5" : "lg:order-1 lg:col-start-1",
            "lg:col-span-8 lg:self-start",
          )}
        >
          <motion.div style={reduce ? undefined : { y: drift }} className="will-change-transform">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 1.06, filter: "blur(14px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={cn(
                  "group/phosphene group/card group/stage relative w-full overflow-hidden rounded-2xl border bg-bg-2",
                )}
                style={{
                  aspectRatio: mediaAspect,
                  // hairline tinted border, barely there — matches the calm hero.
                  borderColor: accent(hue, 0.5, 0.02, 0.25),
                }}
              >
                {isBroker ? (
                  <BrokerPreview />
                ) : isSignalOps ? (
                  <DualImageParallax
                    hero={{
                      src: "/work/signalops/incident.png",
                      label: "incident detail",
                      alt: "SignalOps incident drill-down view",
                    }}
                    dashboard={{
                      src: "/work/signalops/cockpit.png",
                      label: "operations cockpit",
                      alt: "SignalOps operations cockpit dashboard",
                    }}
                  />
                ) : isPhosphene ? (
                  <PhospheneShowcase />
                ) : isRoomboard ? (
                  <RoomboardShowcase />
                ) : fan ? (
                  // ScreenFan (Anchor): spread the fan wider so it fills the frame
                  // edge-to-edge like the other previews, instead of sitting small
                  // in the middle with big p-6 gutters. A mild scale + tighter
                  // padding does it without reworking the fan's own transforms.
                  <div className="absolute inset-0 p-3 sm:p-4">
                    <div className="relative h-full w-full scale-[1.18] sm:scale-[1.32]">
                      <ScreenFan screens={fan} alt={title} />
                    </div>
                  </div>
                ) : imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt={`${title} product preview`}
                    fill
                    sizes="(min-width: 1024px) 760px, 100vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-sans text-[80px] font-medium tracking-[-0.03em] text-white/12">
                      {title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Text (the other side, pinned to top, same baseline as media) */}
        <div
          className={cn(
            "flex flex-col lg:pt-2",
            flip ? "lg:order-1 lg:col-start-1" : "lg:order-2 lg:col-start-9",
            "lg:col-span-4 lg:self-start",
          )}
        >
          <Reveal>
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim">
              <span style={{ color: accent(hue, 0.7, 0.16) }}>{mark}</span>
              <span className="text-fg-muted/60">·</span>
              <span>{year}</span>
              <span className="text-fg-muted/60">·</span>
              <span className="truncate">{role}</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="m-0 mb-4 font-sans text-[clamp(24px,3.2vw,36px)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
              {title}
            </h2>
          </Reveal>
          {tags && tags.length > 0 && (
            <Reveal delay={0.1}>
              <ul className="mb-5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <li
                    key={t}
                    className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-fg-muted"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal delay={0.15}>
            <p className="mb-6 text-[14px] leading-[1.65] text-fg-muted">{blurb}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {href && (
                <Link
                  href={href}
                  prefetch={false}
                  className="group/case inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-2 px-3.5 py-2 font-mono text-[12px] text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  View case study
                  <span className="text-[var(--accent)] transition-transform group-hover/case:translate-x-0.5">→</span>
                </Link>
              )}
              {links
                ?.filter((l) => !l.href.startsWith("/work/"))
                .map((l) => {
                  const isExternal = /^https?:\/\//.test(l.href);
                  return (
                    <a
                      key={l.href}
                      href={l.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="group/link inline-flex items-center gap-1 font-mono text-[12px] text-fg-muted transition-colors hover:text-[var(--accent)]"
                    >
                      {l.label}
                      <span className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">↗</span>
                    </a>
                  );
                })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
