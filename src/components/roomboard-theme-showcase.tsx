"use client";

import Image from "next/image";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";

const THEMES = {
  dark: "/work/roomboard/landing-dark.png",
  light: "/work/roomboard/landing-light.png",
} as const;

type Theme = keyof typeof THEMES;

/**
 * The full Roomboard landing page with a light/dark switch — same product,
 * both themes (including the Pixi-rendered canvas cards, not just the shell).
 */
export function RoomboardThemeShowcase() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <figure className="my-10">
      <div className="relative overflow-hidden rounded-md border border-line-soft bg-bg-2/40 shadow-2xl shadow-black/20">
        <div className="relative aspect-[1440/2442] bg-bg">
          {(Object.keys(THEMES) as Theme[]).map((t) => (
            <Image
              key={t}
              src={THEMES[t]}
              alt={`Roomboard landing — ${t} mode`}
              fill
              sizes="(min-width: 760px) 760px, 100vw"
              priority={t === "dark"}
              className={`object-cover object-top transition-opacity duration-500 ${
                theme === t ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* light / dark switch */}
          <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-full border border-white/15 bg-black/45 p-0.5 backdrop-blur-md">
            {(["light", "dark"] as Theme[]).map((t) => {
              const Icon = t === "light" ? Sun : Moon;
              const active = theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-label={`Show ${t} mode`}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] lowercase tracking-[0.06em] transition-colors ${
                    active ? "bg-white text-black" : "text-white/65 hover:text-white"
                  }`}
                >
                  <Icon className="size-3" />
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <figcaption className="mt-2 border-l border-line-soft pl-3 font-mono text-[11px] leading-relaxed text-fg-dim">
        Same landing, both themes — light mode re-themes the Pixi-rendered canvas cards too, not
        just the DOM shell. Toggle to compare.
      </figcaption>
    </figure>
  );
}
