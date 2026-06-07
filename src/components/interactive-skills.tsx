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
      "Module Federation",
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
      className="mb-14 rounded-md border border-line-soft bg-bg-2/30 px-3 py-3 sm:px-4 transition-colors"
      onMouseLeave={() => setHoveredId(null)}
    >
      <ul className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 w-full gap-2 items-start">
        {SKILLS.map((item) => {
          const isHovered = hoveredId === item.id;

          return (
            <li
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onFocus={() => setHoveredId(item.id)}
              className={cn(
                "relative flex flex-col justify-start rounded-md px-4 py-2 transition-all duration-300 cursor-default",
                isHovered ? "bg-bg-2/50" : ""
              )}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span className="font-mono text-[11px] lowercase tracking-[0.06em] text-fg-muted transition-colors duration-300">
                  {item.title}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {isAnyHovered && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex flex-wrap gap-2 pb-1">
                      {item.skills.map((skill) => (
                        <span
                          key={skill}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] transition-colors duration-300 whitespace-nowrap",
                            isHovered
                              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "bg-bg-2/80 text-fg-dim"
                          )}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
