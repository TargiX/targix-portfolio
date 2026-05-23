"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Pause, Play, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Model ────────────────────────────────────────────────────
type Clip = {
  id: string;
  track: number;
  start: number; // seconds
  duration: number; // seconds
  label: string;
  tone: "accent" | "blue" | "amber" | "violet";
};

const TRACKS = ["video", "overlay", "audio"];
const PX_PER_SEC = 64;
const SNAP = 0.25;
const TOTAL = 12; // seconds
const TRACK_H = 46;
const MIN_DUR = 0.5;

const TONE: Record<Clip["tone"], { bg: string; bar: string; text: string }> = {
  accent: { bg: "color-mix(in oklab, var(--accent) 22%, var(--bg-2))", bar: "var(--accent)", text: "var(--accent)" },
  blue: { bg: "color-mix(in oklab, oklch(0.7 0.15 230) 22%, var(--bg-2))", bar: "oklch(0.7 0.15 230)", text: "oklch(0.78 0.13 230)" },
  amber: { bg: "color-mix(in oklab, oklch(0.78 0.15 70) 22%, var(--bg-2))", bar: "oklch(0.78 0.15 70)", text: "oklch(0.82 0.13 70)" },
  violet: { bg: "color-mix(in oklab, oklch(0.68 0.16 300) 22%, var(--bg-2))", bar: "oklch(0.68 0.16 300)", text: "oklch(0.76 0.14 300)" },
};

const INITIAL: Clip[] = [
  { id: "c1", track: 0, start: 0, duration: 4, label: "intro.mp4", tone: "accent" },
  { id: "c2", track: 0, start: 4.5, duration: 5, label: "demo-reel.mp4", tone: "blue" },
  { id: "c3", track: 1, start: 1.5, duration: 3, label: "title card", tone: "violet" },
  { id: "c4", track: 1, start: 6, duration: 2.5, label: "lower-third", tone: "violet" },
  { id: "c5", track: 2, start: 0, duration: 9.5, label: "music-bed.wav", tone: "amber" },
];

const snap = (v: number) => Math.round(v / SNAP) * SNAP;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type DragState = {
  kind: "move" | "trim-start" | "trim-end" | "scrub";
  id?: string;
  startClientX: number;
  startClientY: number;
  origStart: number;
  origDuration: number;
  origTrack: number;
};

export function TimelineEditor() {
  const [clips, setClips] = useState<Clip[]>(INITIAL);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const laneRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // ── playback loop ──
  useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setPlayhead((p) => {
        const next = p + dt;
        return next >= TOTAL ? 0 : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  // ── pointer drag (move / trim / scrub) ──
  const onPointerDown = useCallback(
    (e: React.PointerEvent, kind: DragState["kind"], clip?: Clip) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      dragRef.current = {
        kind,
        id: clip?.id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        origStart: clip?.start ?? 0,
        origDuration: clip?.duration ?? 0,
        origTrack: clip?.track ?? 0,
      };
      if (clip) setActiveId(clip.id);
      if (kind === "scrub") {
        // jump immediately on ruler click
        const lane = laneRef.current;
        if (lane) {
          const x = e.clientX - lane.getBoundingClientRect().left;
          setPlayhead(clamp(x / PX_PER_SEC, 0, TOTAL));
        }
      }
    },
    [],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startClientX) / PX_PER_SEC;

    if (d.kind === "scrub") {
      const lane = laneRef.current;
      if (lane) {
        const x = e.clientX - lane.getBoundingClientRect().left;
        setPlayhead(clamp(x / PX_PER_SEC, 0, TOTAL));
      }
      return;
    }

    setClips((prev) =>
      prev.map((c) => {
        if (c.id !== d.id) return c;
        if (d.kind === "move") {
          const dyTracks = Math.round((e.clientY - d.startClientY) / TRACK_H);
          const track = clamp(d.origTrack + dyTracks, 0, TRACKS.length - 1);
          const start = clamp(snap(d.origStart + dx), 0, TOTAL - c.duration);
          return { ...c, start, track };
        }
        if (d.kind === "trim-start") {
          const rawStart = clamp(snap(d.origStart + dx), 0, d.origStart + d.origDuration - MIN_DUR);
          const duration = d.origStart + d.origDuration - rawStart;
          return { ...c, start: rawStart, duration };
        }
        // trim-end
        const duration = clamp(snap(d.origDuration + dx), MIN_DUR, TOTAL - c.start);
        return { ...c, duration };
      }),
    );
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // active clips under the playhead
  const activeClips = clips.filter((c) => playhead >= c.start && playhead < c.start + c.duration);

  return (
    <div className="select-none rounded-lg border border-line-soft bg-bg-2/40 p-3 font-mono">
      {/* ── transport + preview ── */}
      <div className="mb-3 flex items-stretch gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="flex w-12 shrink-0 items-center justify-center rounded-md border border-line bg-bg text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4 translate-x-px" fill="currentColor" />}
        </button>

        {/* preview pane: shows what's "on screen" at the playhead */}
        <div className="relative flex-1 overflow-hidden rounded-md border border-line bg-[oklch(0.12_0.005_250)]">
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            {activeClips.filter((c) => c.track < 2).length === 0 ? (
              <span className="text-[10px] lowercase tracking-[0.1em] text-fg-dim">— no frame —</span>
            ) : (
              activeClips
                .filter((c) => c.track < 2)
                .map((c) => (
                  <motion.span
                    key={c.id}
                    layout
                    className="rounded px-2 py-1 text-[10px] tracking-wide"
                    style={{ background: TONE[c.tone].bg, color: TONE[c.tone].text }}
                  >
                    {c.label}
                  </motion.span>
                ))
            )}
          </div>
          {/* audio indicator */}
          {activeClips.some((c) => c.track === 2) && (
            <div className="absolute bottom-1.5 left-2 flex items-end gap-0.5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{
                    height: playing ? `${4 + ((Math.sin((playhead * 6) + i) + 1) * 5)}px` : "4px",
                    background: TONE.amber.bar,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          )}
          <div className="absolute right-2 top-1.5 font-mono text-[10px] tabular-nums text-fg-dim">
            {playhead.toFixed(2)}s / {TOTAL.toFixed(0)}s
          </div>
        </div>
      </div>

      {/* ── timeline ── */}
      <div
        className="relative"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* ruler */}
        <div
          ref={laneRef}
          className="relative ml-16 h-6 cursor-ew-resize border-b border-line-soft"
          onPointerDown={(e) => onPointerDown(e, "scrub")}
        >
          {Array.from({ length: TOTAL + 1 }).map((_, s) => (
            <div key={s} className="absolute top-0 h-full" style={{ left: s * PX_PER_SEC }}>
              <div className="h-2 w-px bg-line" />
              <div className="mt-0.5 text-[8px] text-fg-dim">{s}s</div>
            </div>
          ))}
        </div>

        {/* tracks */}
        {TRACKS.map((name, ti) => (
          <div key={name} className="flex items-stretch border-b border-line-soft/60">
            <div className="flex w-16 shrink-0 items-center text-[10px] lowercase tracking-[0.08em] text-fg-dim">
              {name}
            </div>
            <div className="relative flex-1" style={{ height: TRACK_H, width: TOTAL * PX_PER_SEC }}>
              {clips
                .filter((c) => c.track === ti)
                .map((c) => {
                  const tone = TONE[c.tone];
                  const isActive = activeClips.some((a) => a.id === c.id);
                  return (
                    <div
                      key={c.id}
                      onPointerDown={(e) => onPointerDown(e, "move", c)}
                      className={cn(
                        "group/clip absolute top-1.5 flex h-[34px] cursor-grab items-center overflow-hidden rounded-md border active:cursor-grabbing",
                        activeId === c.id ? "z-10" : "z-0",
                      )}
                      style={{
                        left: c.start * PX_PER_SEC,
                        width: c.duration * PX_PER_SEC,
                        background: tone.bg,
                        borderColor: isActive ? tone.bar : "var(--line)",
                        boxShadow: isActive ? `0 0 0 1px ${tone.bar}, 0 0 14px -4px ${tone.bar}` : "none",
                      }}
                    >
                      {/* trim handles */}
                      <span
                        onPointerDown={(e) => onPointerDown(e, "trim-start", c)}
                        className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize bg-white/0 hover:bg-white/20"
                      />
                      <span
                        onPointerDown={(e) => onPointerDown(e, "trim-end", c)}
                        className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize bg-white/0 hover:bg-white/20"
                      />
                      <span
                        className="truncate px-2 text-[10px]"
                        style={{ color: tone.text }}
                      >
                        {c.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        {/* playhead — spans ruler + tracks, offset by the 64px label gutter */}
        <div
          className="pointer-events-none absolute top-0 z-20"
          style={{
            left: 64 + playhead * PX_PER_SEC,
            height: 24 + TRACKS.length * (TRACK_H + 1),
          }}
        >
          <div className="h-full w-px bg-[var(--accent)]" />
          <div className="absolute -left-[5px] -top-0.5 size-2.5 rotate-45 bg-[var(--accent)]" />
        </div>
      </div>

      {/* hint */}
      <div className="mt-3 flex items-center gap-2 text-[10px] lowercase tracking-[0.06em] text-fg-dim">
        <Scissors className="size-3" />
        drag clips to move · grab an edge to trim · drag the ruler to scrub · ▶ to play
      </div>
    </div>
  );
}

export default TimelineEditor;
