"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PhospheneShowcase } from "@/components/phosphene-showcase";

const cardVariants: Variants = {
  rest: { y: 0 },
  hover: {
    y: -3,
    transition: { type: "spring", stiffness: 220, damping: 24, mass: 0.6 },
  },
};

const indexVariants: Variants = {
  rest: { scale: 1, color: "var(--fg)" },
  hover: {
    scale: 1.1,
    color: "var(--accent)",
    transition: { type: "spring", stiffness: 280, damping: 18 },
  },
};

const underlineVariants: Variants = {
  rest: { scaleX: 0 },
  hover: {
    scaleX: 0.45,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const tagsContainerVariants: Variants = {
  rest: {},
  hover: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
};

const tagVariants: Variants = {
  rest: { y: 0, opacity: 0.85, borderColor: "var(--line)" },
  hover: {
    y: -2,
    opacity: 1,
    borderColor: "color-mix(in oklab, var(--accent) 45%, var(--line))",
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
};

export function CaseCard({
  project,
  compact = false,
  className,
}: {
  project: Project;
  compact?: boolean;
  className?: string;
}) {
  const { index, year, role, title, blurb, tags, links, featured } = project;

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardVariants}
      className={cn(
        "group/case grid gap-6 py-7",
        compact ? "grid-cols-[60px_1fr]" : "grid-cols-1 sm:grid-cols-[90px_1fr]",
        !compact && "border-t border-dashed border-line-soft first:border-t-0 first:pt-0",
        className,
      )}
    >
      <div className="flex flex-col gap-1 text-[11px] text-fg-dim">
        <motion.span
          variants={indexVariants}
          className="inline-block text-[18px] leading-none will-change-transform"
        >
          {index}
        </motion.span>
        <span className="tracking-[0.04em] transition-colors duration-300 group-hover/case:text-fg-muted">
          {year}
        </span>
      </div>

      <div>
        <div className="mb-2 text-[11px] lowercase tracking-[0.06em] text-fg-muted">{role}</div>

        <div className="mb-3.5 inline-block">
          <h3
            className={cn(
              "m-0 font-sans font-medium tracking-[-0.015em] transition-colors duration-300 group-hover/case:text-[color:var(--accent)]",
              compact ? "text-[22px]" : "text-[28px]",
            )}
          >
            {title}
          </h3>
          <motion.span
            variants={underlineVariants}
            className="block h-[2px] origin-left rounded-full bg-[var(--accent)] will-change-transform"
          />
        </div>

        <p
          className={cn(
            "mb-4 max-w-[56ch] text-fg-muted transition-colors duration-500 group-hover/case:text-fg",
            compact && "text-[13px]",
          )}
        >
          {blurb}
        </p>

        {featured && (
          <div className="my-1 mb-5 overflow-hidden rounded-md border border-line bg-bg-2 transition-colors duration-300 group-hover/case:border-[color:color-mix(in_oklab,var(--accent)_30%,var(--line))]">
            <div className="flex items-center gap-1.5 border-b border-line-soft bg-[oklch(0.18_0.006_250)] px-3 py-2 text-[10px] text-fg-dim">
              <span className="size-2 rounded-full bg-line" />
              <span className="size-2 rounded-full bg-line" />
              <span className="size-2 rounded-full bg-line" />
              <span className="ml-3 font-mono tracking-[0.02em]">phosphene.cc /workspace</span>
              <span className="ml-auto font-mono text-[9px] tracking-[0.08em] uppercase text-[color:color-mix(in_oklab,var(--accent)_60%,var(--fg-dim))]">
                live
              </span>
            </div>
            <PhospheneShowcase />
          </div>
        )}

        {tags?.length > 0 && (
          <motion.ul
            variants={tagsContainerVariants}
            className="mb-4 flex flex-wrap gap-1.5"
          >
            {tags.map((t) => (
              <motion.li
                key={t}
                variants={tagVariants}
                className="whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] text-fg-muted will-change-transform"
              >
                {t}
              </motion.li>
            ))}
          </motion.ul>
        )}

        {links?.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {links.map((l) => {
              const isExternal = /^https?:\/\//.test(l.href);
              const arrow = isExternal ? "↗" : "→";
              const className =
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
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                >
                  {inner}
                </a>
              ) : (
                <Link key={l.label} href={l.href} className={className} prefetch>
                  {inner}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </motion.article>
  );
}
