"use client";

import { useState } from "react";
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
      className="rounded-lg border border-white/10 bg-[rgba(7,12,15,.34)] px-3 py-2.5 shadow-[0_24px_80px_rgba(0,0,0,.24)] backdrop-blur-xl transition-colors sm:px-4 sm:py-3"
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
                "relative flex min-h-[34px] cursor-default flex-col justify-start rounded-md px-3 py-2 transition-colors duration-300 md:min-h-[94px]",
                isHovered ? "bg-white/[0.045]" : ""
              )}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_55%,transparent)]" />
                <span className="font-mono text-[11px] lowercase tracking-[0.06em] text-fg transition-colors duration-300">
                  {item.title}
                </span>
              </div>

              <div
                data-skill-list
                className={cn(
                  "mt-3 hidden flex-wrap gap-x-4 gap-y-2 pb-1 transition-opacity duration-300 md:flex",
                  isAnyHovered && !isHovered ? "opacity-45" : "opacity-100",
                )}
              >
                {item.skills.map((skill) => (
                  <span
                    key={skill}
                    className={cn(
                      "whitespace-nowrap font-mono text-[10px] transition-colors duration-300",
                      isHovered
                        ? "text-[var(--accent)]"
                        : "text-fg-dim"
                    )}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
