"use client";

import { motion } from "motion/react";

// Floating frosted-glass blobs (noomo-style). Pure CSS glass via backdrop-filter,
// drifting slowly. They sit *below* the text in z-order so they frost the dot
// background but never blur the copy.
const FORMS = [
  { size: 300, top: "6%", left: "52%", dur: 19, delay: 0, blob: "42% 58% 60% 40% / 55% 45% 58% 42%" },
  { size: 210, top: "44%", left: "70%", dur: 24, delay: 1.5, blob: "60% 40% 45% 55% / 42% 60% 40% 58%" },
  { size: 150, top: "64%", left: "44%", dur: 28, delay: 0.8, blob: "52% 48% 56% 44% / 60% 40% 62% 38%" },
];

export function GlassForms() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] hidden overflow-hidden sm:block"
      aria-hidden="true"
    >
      {FORMS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: f.size, height: f.size, top: f.top, left: f.left }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -26, 0],
            x: [0, 16, 0],
            rotate: [0, 7, 0],
          }}
          transition={{
            opacity: { duration: 1.2, delay: f.delay },
            scale: { duration: 1.2, delay: f.delay },
            y: { duration: f.dur, repeat: Infinity, ease: "easeInOut", delay: f.delay },
            x: { duration: f.dur * 1.3, repeat: Infinity, ease: "easeInOut", delay: f.delay },
            rotate: { duration: f.dur * 1.6, repeat: Infinity, ease: "easeInOut", delay: f.delay },
          }}
        >
          <div className="glass-form size-full" style={{ borderRadius: f.blob }} />
        </motion.div>
      ))}
    </div>
  );
}
