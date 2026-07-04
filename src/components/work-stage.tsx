"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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

// Per-work accent theme. Stages keep a restrained tint for borders only; the
// heavy ambient glow was removed so the hero cube remains the main color event.
type Theme = { primary: number; secondary: number; name: string };

const WORK_THEME: Record<string, Theme> = {
  // Complementary hues based on the hero's lime/teal (140-180 range)
  "broker-online-exchange": {
    primary: 145,
    secondary: 165,
    name: "lime→teal",
  },
  signalops: {
    primary: 155,
    secondary: 185,
    name: "green→teal",
  },
  phosphene: {
    primary: 165,
    secondary: 135,
    name: "teal→lime",
  },
  roomboard: {
    primary: 140,
    secondary: 175,
    name: "lime→teal",
  },
  anchor: {
    primary: 150,
    secondary: 178,
    name: "emerald→teal",
  },
};

const accent = (hue: number, lightness = 0.72, chroma = 0.16, alpha = 1) =>
  alpha < 1
    ? `oklch(${lightness} ${chroma} ${hue} / ${alpha})`
    : `oklch(${lightness} ${chroma} ${hue})`;

function CountUpNumber({
  value,
  pad = 0,
  delay = 0,
  className,
}: {
  value: number;
  pad?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.55, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduce, value]);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let timeout = 0;
    const duration = value > 999 ? 1100 : 760;

    timeout = window.setTimeout(() => {
      const start = window.performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        setDisplay(Math.round(value * eased));

        if (progress < 1) {
          frame = window.requestAnimationFrame(tick);
        }
      };

      frame = window.requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [active, delay, reduce, value]);

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {Math.min(display, value).toString().padStart(pad, "0")}
    </span>
  );
}

function CountUpText({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {text.split(/(\d+)/g).map((part, i) =>
        /^\d+$/.test(part) ? (
          <CountUpNumber
            key={`${part}-${i}`}
            value={Number(part)}
            pad={part.length}
            delay={delay + i * 70}
          />
        ) : (
          <span key={`${part}-${i}`}>{part}</span>
        ),
      )}
    </span>
  );
}

/**
 * One featured project as a full-screen scroll-snap stage.
 *
 * Layout: media dominates the left ~64% of the row, a narrow text column sits
 * to the right; BOTH are pinned to the top of the row on the same baseline so
 * the title reads next to the top of the screenshot, not stranded at the
 * bottom. Media flips sides each item for rhythm.
 *
 * Media dispatch mirrors the home-card logic but leans into per-project
 * compositions: Broker gets a 5-shot preview wall, SignalOps gets a hero +
 * long-dashboard pair, the live demos (Phosphene/Roomboard) keep their
 * interactive showcases, Anchor keeps its ScreenFan.
 */
export function WorkStage({ project, index }: { project: Project; index: number }) {
  const { year, role, title, blurb, tags, links, caseSlug, screens, thumb, demo } =
    project;
  const href = caseSlug ? `/work/${caseSlug}` : undefined;
  const fan = screens && screens.length > 0 ? screens : null;
  const imagePreview = thumb ?? null;
  const flip = index % 2 === 1; // alternate sides for visual rhythm
  const reduce = useReducedMotion();

  // Per-work color identity for tiny UI accents only.
  const theme = (caseSlug && WORK_THEME[caseSlug]) || {
    primary: 145,
    secondary: 178,
    name: "accent",
  };
  const { primary: hue } = theme;

  // One consistent media aspect across all stages — no per-index variation.
  // (An earlier version alternated 16/12 vs 16/10 and offset the media up/down,
  // which read as "different preview sizes" rather than rhythm.) Only the side
  // flips, so the eye gets left/right variation without the frame resizing.
  const mediaAspect = "16/10";

  const isBroker = demo === "broker";
  const isSignalOps = caseSlug === "signalops";
  const isPhosphene = demo === "phosphene";
  const isRoomboard = demo === "roomboard";

  return (
    <section
      id={caseSlug}
      data-work-stage
      data-screen-label={`0${index + 1} ${title}`}
      className="work-stage relative flex items-center"
    >
      <StageBackdrop flip={flip} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 items-stretch gap-8 px-5 py-12 sm:gap-12 sm:px-8 sm:py-14 lg:grid-cols-12">
        {/* ── Media (left or right) ───────────────────────── */}
        <div
          className={cn(
            "relative",
            flip
              ? "lg:order-2 lg:col-start-5 lg:ml-2 lg:w-[calc(100%+2rem)] xl:ml-4 xl:w-[calc(100%+2.5rem)]"
              : "lg:order-1 lg:col-start-1",
            "lg:col-span-8 lg:self-start",
          )}
        >
          <motion.div
            className="will-change-transform"
            initial={reduce ? false : { opacity: 0, y: 42, scale: 0.985, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-14% 0px -12% 0px" }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={cn(
                "group/phosphene group/card group/stage relative w-full",
                isSignalOps
                  ? "overflow-visible rounded-none border-0 bg-transparent"
                  : "overflow-hidden rounded-2xl border bg-bg-2",
                href && "cursor-pointer",
              )}
              style={{
                aspectRatio: mediaAspect,
                // hairline tinted border, barely there — matches the calm hero.
                borderColor: isSignalOps ? "transparent" : accent(hue, 0.5, 0.02, 0.25),
              }}
            >
                {isBroker ? (
                  <div className="absolute inset-[-4%] scale-[1.035]">
                    <div className="work-stage-media-drift h-full w-full">
                      <BrokerPreview />
                    </div>
                  </div>
                ) : isSignalOps ? (
                  <div className="absolute inset-[-4%]">
                    <div className="h-full w-full">
                      <DualImageParallax
                        hero={{
                          src: "/work/signalops/landing.png",
                          alt: "SignalOps landing page hero",
                        }}
                        dashboard={{
                          src: "/work/signalops/cockpit.png",
                          alt: "SignalOps operations cockpit dashboard",
                        }}
                      />
                    </div>
                  </div>
                ) : isPhosphene ? (
                  <div className="absolute inset-[-8%] scale-[1.055]">
                    <div className="work-stage-media-drift h-full w-full">
                      <PhospheneShowcase />
                    </div>
                  </div>
                ) : isRoomboard ? (
                  <div className="absolute inset-[-8%] scale-[1.055]">
                    <div className="work-stage-media-drift h-full w-full">
                      <RoomboardShowcase />
                    </div>
                  </div>
                ) : fan ? (
                  // ScreenFan (Anchor): spread the fan wider so it fills the frame
                  // edge-to-edge like the other previews, instead of sitting small
                  // in the middle with big p-6 gutters. A mild scale + tighter
                  // padding does it without reworking the fan's own transforms.
                  <div className="absolute inset-0 p-3 sm:p-4">
                    <div className="work-stage-media-drift relative h-full w-full">
                      <div className="relative h-full w-full scale-[1.18] sm:scale-[1.32]">
                        <ScreenFan screens={fan} alt={title} />
                      </div>
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div className="absolute inset-[-8%] scale-[1.055]">
                    <div className="work-stage-media-drift relative h-full w-full">
                      <Image
                        src={imagePreview}
                        alt={`${title} product preview`}
                        fill
                        sizes="(min-width: 1024px) 760px, 100vw"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-sans text-[80px] font-medium tracking-[-0.03em] text-white/12">
                      {title.charAt(0)}
                    </span>
                  </div>
                )}
                {href && (
                  <Link
                    href={href}
                    prefetch={false}
                    aria-label={`${title} — open case study`}
                    className={cn(
                      "absolute inset-0 z-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                      isSignalOps ? "rounded-lg" : "rounded-2xl",
                    )}
                  />
                )}
            </div>
          </motion.div>
        </div>

        {/* ── Text (the other side, pinned to top, same baseline as media) */}
        <div
          className={cn(
            "work-stage-copy flex flex-col lg:pt-2",
            flip ? "lg:order-1 lg:col-start-1" : "lg:order-2 lg:col-start-9",
            "lg:col-span-4 lg:self-start",
          )}
        >
          <Reveal>
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim">
              <CountUpNumber
                value={index + 1}
                pad={2}
                className="text-[var(--accent)]"
              />
              <span className="text-fg-muted/60">/</span>
              <CountUpText text={year} delay={130} className="whitespace-nowrap" />
              <span className="text-fg-muted/60 hidden sm:inline">/</span>
              <span className="w-full sm:w-auto">{role.replace(' · ', '\n')}</span>
            </div>
          </Reveal>

          <span className="work-stage-title-rule" aria-hidden="true" />

          <Reveal delay={0.05}>
            <h2 className="m-0 mb-4 font-sans text-[clamp(24px,3.2vw,36px)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
              {href ? (
                <Link
                  href={href}
                  prefetch={false}
                  className="transition-colors hover:text-[var(--accent)]"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </h2>
          </Reveal>
          {tags && tags.length > 0 && (
            <Reveal delay={0.1}>
              <ul className="mb-5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <li
                    key={t}
                    className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-fg-muted transition-colors duration-500 ease-out hover:border-brand hover:text-brand cursor-default"
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
                  className="btn-hover-gradient-border group/case inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-2 px-3.5 py-2 font-mono text-[12px] text-fg transition-colors hover:text-[var(--accent)]"
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
