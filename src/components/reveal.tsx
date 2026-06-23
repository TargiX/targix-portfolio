"use client";

import { type ElementType, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * On-scroll reveal wrapper. The old code rolled a manual IntersectionObserver
 * because motion's whileInView mis-detected inside the ViewSwitcher's
 * AnimatePresence + overflow container. With that container gone, whileInView
 * works reliably, so this is a thin, declarative version of the same idea:
 * fade + rise once, then never again.
 *
 * `delay` lets callers stagger children; `as` lets it wrap any element.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduce) {
    return <MotionTag className={className}>{children}</MotionTag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}
