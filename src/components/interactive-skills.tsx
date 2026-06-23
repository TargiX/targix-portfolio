"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const SKILLS = [
  {
    id: "react",
    title: "React / Next.js systems",
    skills: [
      "React 19",
      "Next.js App Router",
      "TanStack Query",
      "Zustand",
      "TypeScript",
      "Mantine",
    ],
  },
  {
    id: "vue",
    title: "Vue / Nuxt product apps",
    skills: ["Vue 3", "Nuxt", "Pinia / Vuex", "VueUse"],
  },
  {
    id: "ai",
    title: "AI workflows",
    skills: ["Vertex AI / Gemini", "Prompt Design", "Streaming UIs", "LLM Response Handling"],
  },
  {
    id: "data",
    title: "Data-heavy dashboards",
    skills: ["TanStack Table", "Virtualization", "DevExtreme", "Data Visualization", "WebSockets"],
  },
  {
    id: "visual",
    title: "Visual editors",
    skills: ["Canvas API", "WebGL / Three.js", "Pixi.js", "Drag & Drop"],
  },
];

export function InteractiveSkills() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isAnyHovered = hoveredId !== null;

  return (
    <section
      aria-label="Frontend engineering proof points"
      className="rounded-lg border border-white/12 bg-white/[0.055] px-3 py-2.5 shadow-[0_16px_44px_rgba(0,0,0,.26),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl transition-colors sm:px-4 sm:py-3"
      onMouseLeave={() => setHoveredId(null)}
    >
      <ul className="grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {SKILLS.map((item) => {
          const isHovered = hoveredId === item.id;

          return (
            <li
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onFocus={() => setHoveredId(item.id)}
              className={cn(
                "relative flex cursor-default flex-col justify-start px-3 py-2 transition-all duration-300"
              )}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_55%,transparent)]" />
                <span className="font-mono text-[11px] lowercase tracking-[0.06em] text-fg transition-colors duration-300">
                  {item.title}
                </span>
              </div>

              {/* Mobile: always visible, Desktop: smoothly expands when ANY column is hovered */}
              <div className="md:hidden mt-3 flex flex-wrap gap-x-4 gap-y-2 pb-1">
                {item.skills.map((skill) => (
                  <span
                    key={skill}
                    className="whitespace-nowrap font-mono text-[10px] text-fg-muted"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="hidden md:block">
                <AnimatePresence initial={false}>
                  {isAnyHovered && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 pb-1">
                        {item.skills.map((skill) => (
                          <span
                            key={skill}
                            className={cn(
                              "whitespace-nowrap font-mono text-[10px] transition-colors duration-300",
                              isHovered ? "text-[var(--accent)]" : "text-fg-muted"
                            )}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
