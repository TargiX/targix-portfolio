"use client";

import { useRef, type CSSProperties } from "react";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

const LEVEL_FILL = [
  "var(--line-soft)",
  "color-mix(in oklab, var(--accent) 28%, var(--bg-2))",
  "color-mix(in oklab, var(--accent) 52%, var(--bg-2))",
  "color-mix(in oklab, var(--accent) 76%, var(--bg-2))",
  "var(--accent)",
] as const;

// the panel revealed mid-flip — a brighter accent shade, like a flip-board tile
const BACK_FILL = "color-mix(in oklab, var(--accent) 55%, var(--bg-2))";

const GAP = 3;
const FLIP_HOLD = 650; // ms a flipped cell stays before turning back (the trail)
const TIP_DELAY = 320; // ms hover dwell before the tooltip appears

export function ContribGrid({
  weeks,
  gridW,
  topPad,
  monthLabels,
  ariaLabel,
}: {
  weeks: Day[][];
  gridW: number;
  topPad: number;
  monthLabels: { x: number; label: string }[];
  ariaLabel: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const flipTimers = useRef(new WeakMap<HTMLElement, number>());
  const tipTimer = useRef<number | undefined>(undefined);
  const weekCount = Math.max(weeks.length, 1);
  const gridStyle = {
    "--contrib-gap": `${GAP}px`,
    width: gridW,
    paddingTop: topPad,
  } as CSSProperties;

  const handleOver = (e: React.PointerEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>(".contrib-cell");
    if (!cell) return;

    // flip immediately, then schedule the turn-back → leaves a trail behind the cursor
    cell.classList.add("flipped");
    const prev = flipTimers.current.get(cell);
    if (prev) clearTimeout(prev);
    flipTimers.current.set(
      cell,
      window.setTimeout(() => cell.classList.remove("flipped"), FLIP_HOLD),
    );

    // styled tooltip, only after a short dwell on a cell
    if (tipTimer.current) clearTimeout(tipTimer.current);
    tipTimer.current = window.setTimeout(() => {
      const tip = tipRef.current;
      const wrap = wrapRef.current;
      if (!tip || !wrap) return;
      const cr = cell.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      tip.textContent = cell.dataset.label ?? "";
      tip.style.left = `${cr.left - wr.left + cr.width / 2}px`;
      tip.style.top = `${cr.top - wr.top}px`;
      tip.style.opacity = "1";
    }, TIP_DELAY);
  };

  const handleLeave = () => {
    if (tipTimer.current) clearTimeout(tipTimer.current);
    if (tipRef.current) tipRef.current.style.opacity = "0";
  };

  return (
    <div ref={wrapRef} className="relative" onPointerOver={handleOver} onPointerLeave={handleLeave}>
      <div className="overflow-x-auto py-1.5">
        <div
          className="relative max-w-none"
          style={gridStyle}
          role="img"
          aria-label={ariaLabel}
        >
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute top-0 font-mono text-[9px] text-fg-dim"
              style={{ left: `${(m.x / gridW) * 100}%` }}
            >
              {m.label}
            </span>
          ))}

          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${weekCount}, minmax(6px, 1fr))`,
              gridTemplateRows: "repeat(7, auto)",
              columnGap: "var(--contrib-gap)",
              rowGap: "var(--contrib-gap)",
            }}
          >
            {weeks.map((week, wi) =>
              week.map((day) => {
                const dow = new Date(day.date + "T00:00:00Z").getUTCDay();
                return (
                  <div
                    key={day.date}
                    className="contrib-cell"
                    style={{ gridColumn: wi + 1, gridRow: dow + 1 }}
                    data-label={`${day.count} contribution${day.count === 1 ? "" : "s"} · ${day.date}`}
                  >
                    <div className="contrib-flip">
                      <span className="contrib-face contrib-front" style={{ background: LEVEL_FILL[day.level] }} />
                      <span className="contrib-face contrib-back" style={{ background: BACK_FILL }} />
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>

      <div ref={tipRef} className="contrib-tip" aria-hidden="true" />
    </div>
  );
}
