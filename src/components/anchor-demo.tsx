"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ANCHOR_DEPLOYED, ANCHOR_REPO_URL, ANCHOR_URL } from "@/lib/project-links";

/**
 * Live, interactive embed of the Anchor app inside a phone frame, with a
 * screenshot fallback, an auto-rotating view switcher, and 404-safe links.
 *
 * ── To go live ──────────────────────────────────────────────────────────
 *  1. Deploy Anchor, set the shared ANCHOR_URL to the real https://…vercel.app.
 *  2. Flip ANCHOR_DEPLOYED to true.
 * Until then it shows captured screenshots (no failed requests, no dead links —
 * the "open" link points at the repo). Once live it embeds the real app and
 * still falls back to a screenshot if the iframe is blocked or slow.
 */
const LOAD_TIMEOUT_MS = 4500;
const ROTATE_MS = 4000;

type View = { id: string; label: string; path: string; img: string };

const VIEWS: View[] = [
  { id: "landing", label: "Landing", path: "/", img: "/work/anchor/landing.png" },
  { id: "dashboard", label: "Dashboard", path: "/app", img: "/work/anchor/dashboard.png" },
  { id: "morning", label: "Morning ritual", path: "/morning", img: "/work/anchor/sleep.png" },
];

type FrameStatus = "loading" | "live" | "fallback";

export function AnchorDemo() {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<FrameStatus>(ANCHOR_DEPLOYED ? "loading" : "fallback");
  const [hovering, setHovering] = useState(false);
  const [locked, setLocked] = useState(false); // set once the user clicks a tab
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = VIEWS[index];
  const liveHref = ANCHOR_DEPLOYED ? `${ANCHOR_URL}${active.path}` : ANCHOR_REPO_URL;
  // Pause on hover (so people can read), stop for good once they pick a tab,
  // and never thrash a live iframe.
  const canRotate = !hovering && !locked && (!ANCHOR_DEPLOYED || status !== "live");

  // Auto-advance through the views.
  useEffect(() => {
    if (!canRotate) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % VIEWS.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [canRotate]);

  // When deployed: per-view load timeout → fall back to the screenshot.
  useEffect(() => {
    if (!ANCHOR_DEPLOYED) return;
    setStatus("loading");
    loadTimer.current = setTimeout(() => setStatus("fallback"), LOAD_TIMEOUT_MS);
    return () => {
      if (loadTimer.current) clearTimeout(loadTimer.current);
    };
  }, [index]);

  const handleLoad = useCallback(() => {
    if (loadTimer.current) clearTimeout(loadTimer.current);
    setStatus("live");
  }, []);

  const pick = useCallback((i: number) => {
    setLocked(true); // user took control — stop auto-rotation for good
    setIndex(i);
  }, []);

  return (
    <figure
      className="my-8 flex flex-col items-center gap-5"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* View switcher */}
      <div
        role="tablist"
        aria-label="Anchor views"
        className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-line-soft bg-bg-2/50 p-1"
      >
        {VIEWS.map((v, i) => {
          const selected = i === index;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={selected}
              onClick={() => pick(i)}
              className={
                "rounded-full px-3 py-1 font-mono text-[10px] lowercase tracking-[0.06em] transition-colors " +
                (selected
                  ? "bg-[var(--accent)] text-[oklch(0.16_0.006_250)]"
                  : "text-fg-dim hover:text-fg")
              }
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Phone frame */}
      <div className="relative rounded-[2.4rem] border border-line bg-[oklch(0.16_0.006_250)] p-2.5 shadow-2xl shadow-black/40">
        <div className="absolute left-1/2 top-2.5 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-[oklch(0.16_0.006_250)]" />

        <div className="relative h-[600px] w-[300px] overflow-hidden rounded-[1.9rem] bg-bg-2">
          {/* Screenshot — base layer / fallback. Keyed so it crossfades on change. */}
          <Image
            key={active.id}
            src={active.img}
            alt={`Anchor — ${active.label}`}
            fill
            sizes="300px"
            priority={active.id === "landing"}
            className="animate-in fade-in object-cover object-top duration-700"
          />

          {/* Live iframe on top when deployed + loaded */}
          {ANCHOR_DEPLOYED && status !== "fallback" && (
            <iframe
              key={`frame-${active.id}`}
              src={`${ANCHOR_URL}${active.path}`}
              title={`Anchor — ${active.label} (live)`}
              loading="lazy"
              onLoad={handleLoad}
              className="absolute inset-0 h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          )}

          {ANCHOR_DEPLOYED && status === "loading" && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <span className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] text-white/80 backdrop-blur">
                loading live app…
              </span>
            </div>
          )}

          {/* Progress dots */}
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {VIEWS.map((v, i) => (
              <span
                key={v.id}
                className={
                  "h-1 rounded-full transition-[background-color,width] duration-300 " +
                  (i === index ? "w-4 bg-[var(--accent)]" : "w-1 bg-white/40")
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Caption */}
      <figcaption className="flex items-center gap-3 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
        <span className="flex items-center gap-1.5">
          <span
            className={
              "inline-block size-1.5 rounded-full " +
              (status === "live" ? "bg-[var(--accent)]" : "bg-fg-dim")
            }
          />
          {status === "live" ? "live · interactive" : "screenshot · " + active.label.toLowerCase()}
        </span>
        <span className="size-1 rounded-full bg-fg-dim" />
        <a
          href={liveHref}
          target="_blank"
          rel="noreferrer"
          className="group border-b border-line pb-0.5 text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {ANCHOR_DEPLOYED ? "open live" : "view source"}
          <span className="ml-1 inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            ↗
          </span>
        </a>
      </figcaption>
    </figure>
  );
}
