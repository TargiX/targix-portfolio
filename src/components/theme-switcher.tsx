"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

const OPTIONS: Array<{ id: ThemeMode; label: string; icon: typeof Monitor }> = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.dataset.theme = mode;
  }
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const next = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";

    setMode(next);
    applyTheme(next);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = OPTIONS.find((option) => option.id === mode) ?? OPTIONS[0];
  const ActiveIcon = active.icon;

  const choose = (next: ThemeMode) => {
    setMode(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${active.label}`}
        onClick={() => setOpen((value) => !value)}
        className="flex size-8 items-center justify-center rounded-md border border-line-soft bg-bg-2/55 text-fg-dim transition-colors hover:border-line hover:text-fg"
      >
        <ActiveIcon className="size-3.5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-36 overflow-hidden rounded-lg border border-line-soft bg-bg/96 p-1 shadow-2xl shadow-black/10 backdrop-blur"
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = option.id === mode;

            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => choose(option.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left font-mono text-[11px] transition-colors",
                  selected ? "bg-bg-2 text-fg" : "text-fg-dim hover:bg-bg-2/70 hover:text-fg-muted",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
