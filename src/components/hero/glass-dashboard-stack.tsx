"use client";

import { useEffect, useRef, useState } from "react";

const workflowNodes = [
  { label: "User input", x: 14, y: 50, w: 18 },
  { label: "AI model", x: 38, y: 30, w: 19 },
  { label: "Orchestrator", x: 38, y: 70, w: 22 },
  { label: "Data enrich", x: 62, y: 30, w: 23 },
  { label: "Validate", x: 62, y: 70, w: 20 },
  { label: "Response", x: 86, y: 50, w: 16 },
];

function MetricsPanel() {
  const [metrics, setMetrics] = useState([
    { label: "Users", value: 28400, delta: "+12.4%", format: (v: number) => `${(v / 1000).toFixed(1)}K` },
    { label: "Sessions", value: 62700, delta: "+8.4%", format: (v: number) => `${(v / 1000).toFixed(1)}K` },
    { label: "Conversion", value: 3.21, delta: "+2.1%", format: (v: number) => `${v.toFixed(2)}%` },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.label === "Conversion") {
            const change = (Math.random() - 0.5) * 0.4;
            return { ...m, value: Math.max(0, m.value + change) };
          } else {
            const change = Math.floor((Math.random() - 0.5) * 400);
            return { ...m, value: Math.max(0, m.value + change) };
          }
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <article className="glass-dash-panel glass-dash-panel--metrics">
      <div className="glass-dash-head">
        <span className="glass-dash-dot" />
        <span>Metrics Overview</span>
        <span className="ml-auto text-[8px] text-fg-dim">Last 7 days</span>
      </div>
      <div className="mt-3 grid grid-cols-[72px_minmax(0,1fr)] gap-3">
        <div className="grid gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-md border border-white/8 bg-white/[0.035] px-2 py-1.5">
              <div className="text-[7px] text-fg-dim">{m.label}</div>
              <div className="mt-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[10px] text-fg transition-all duration-300">{m.format(m.value)}</span>
                <span className="text-[7px] text-[var(--accent)]">{m.delta}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="relative min-h-[124px] overflow-hidden rounded-md border border-white/8 bg-black/10 px-3 py-2">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:36px_28px]" />
          <svg className="relative z-10 h-full w-full" viewBox="0 0 260 124" aria-hidden="true">
            <defs>
              <linearGradient id="metricFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="rgb(var(--accent-rgb))" stopOpacity="0.2" />
                <stop offset="1" stopColor="rgb(var(--accent-rgb))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M4 104 C28 60 42 42 60 76 C82 116 100 38 124 54 C142 66 148 98 170 76 C192 52 206 18 224 34 C238 48 238 88 256 52 L256 124 L4 124 Z" 
              fill="url(#metricFill)"
            >
              <animate
                attributeName="d"
                values="M4 104 C28 60 42 42 60 76 C82 116 100 38 124 54 C142 66 148 98 170 76 C192 52 206 18 224 34 C238 48 238 88 256 52 L256 124 L4 124 Z;
                        M4 104 C28 56 42 46 60 76 C82 112 100 42 124 54 C142 62 148 94 170 76 C192 56 206 22 224 34 C238 44 238 84 256 52 L256 124 L4 124 Z;
                        M4 104 C28 64 42 38 60 76 C82 120 100 34 124 54 C142 70 148 102 170 76 C192 48 206 14 224 34 C238 52 238 92 256 52 L256 124 L4 124 Z;
                        M4 104 C28 60 42 42 60 76 C82 116 100 38 124 54 C142 66 148 98 170 76 C192 52 206 18 224 34 C238 48 238 88 256 52 L256 124 L4 124 Z"
                dur="8s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M4 104 C28 60 42 42 60 76 C82 116 100 38 124 54 C142 66 148 98 170 76 C192 52 206 18 224 34 C238 48 238 88 256 52"
              fill="none"
              stroke="rgb(var(--accent-rgb))"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M4 104 C28 60 42 42 60 76 C82 116 100 38 124 54 C142 66 148 98 170 76 C192 52 206 18 224 34 C238 48 238 88 256 52;
                        M4 104 C28 56 42 46 60 76 C82 112 100 42 124 54 C142 62 148 94 170 76 C192 56 206 22 224 34 C238 44 238 84 256 52;
                        M4 104 C28 64 42 38 60 76 C82 120 100 34 124 54 C142 70 148 102 170 76 C192 48 206 14 224 34 C238 52 238 92 256 52;
                        M4 104 C28 60 42 42 60 76 C82 116 100 38 124 54 C142 66 148 98 170 76 C192 52 206 18 224 34 C238 48 238 88 256 52"
                dur="8s"
                repeatCount="indefinite"
              />
            </path>
            {[4, 60, 124, 170, 224, 256].map((x, i) => {
              const yVals = [104, 76, 54, 76, 34, 52];
              return (
                <circle 
                  key={x} 
                  cx={x} 
                  cy={yVals[i]}
                  r="2.4" 
                  fill="rgb(var(--accent-rgb))"
                  style={{ animation: `point-pulse ${2 + i * 0.5}s ease-in-out infinite alternate` }}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </article>
  );
}

function WorkflowPanel() {
  return (
    <article className="glass-dash-panel glass-dash-panel--workflow">
      <div className="glass-dash-head">
        <span className="glass-dash-dot" />
        <span>AI Workflow</span>
      </div>
      <div className="relative mt-4 h-[148px] overflow-hidden rounded-md border border-white/8 bg-black/10">
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 23 50 L 28.5 30
                   M 23 50 L 27 70
                   M 47.5 30 L 50.5 30
                   M 49 70 L 52 70
                   M 73.5 30 L 78 50
                   M 72 70 L 78 50"
                stroke="rgba(125,249,174,.45)" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {workflowNodes.map((node) => (
          <div
            key={node.label}
            className="absolute flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.035] px-2 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm"
            style={{ left: `${node.x}%`, top: `${node.y}%`, width: `${node.w}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" />
            <div className="truncate text-[7px] text-fg">{node.label}</div>
          </div>
        ))}
      </div>
    </article>
  );
}

function EditorPanel() {
  return (
    <article className="glass-dash-panel glass-dash-panel--editor">
      <div className="glass-dash-head">
        <span>Visual Editor</span>
        <span className="ml-auto text-fg-dim">x</span>
      </div>
      <div className="mt-3 grid grid-cols-[92px_minmax(0,1fr)_120px] gap-3">
        <div className="rounded-md border border-white/8 bg-white/[0.035] p-2">
          {["Layers", "Components", "Styles", "Interactions", "Data", "Settings"].map((item) => (
            <div key={item} className="flex items-center gap-2 py-1 text-[7px] text-fg-dim">
              <span className="size-1 rounded-full border border-white/20" />
              {item}
            </div>
          ))}
        </div>
        <div className="relative min-h-[150px] overflow-hidden rounded-md border border-white/8 bg-black/10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <svg className="absolute inset-[18px] size-[calc(100%-36px)]" viewBox="0 0 360 160" aria-hidden="true">
            <path d="M0 126 L42 86 L82 104 L118 54 L166 98 L210 64 L260 88 L320 44 L360 72" fill="none" stroke="rgba(214,255,224,.26)" strokeWidth="1.6" />
            <path d="M0 146 L54 92 L96 118 L136 74 L178 108 L224 72 L276 98 L328 58 L360 88" fill="none" stroke="rgba(125,249,174,.24)" strokeWidth="1.2" />
            {Array.from({ length: 7 }, (_, i) => (
              <path key={i} d={`M0 ${138 - i * 8} C80 ${98 - i * 9} 108 ${154 - i * 7} 178 ${102 - i * 5} S286 ${72 + i * 6} 360 ${82 - i * 4}`} fill="none" stroke="rgba(204,255,218,.08)" strokeWidth="1" />
            ))}
            <rect x="32" y="22" width="286" height="118" fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="1.8" />
            {[32, 318].map((x) => [22, 140].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="rgb(var(--accent-rgb))" />))}
          </svg>
        </div>
        <div className="rounded-md border border-white/8 bg-white/[0.035] p-2">
          <div className="mb-2 text-[7px] text-fg-muted">Properties</div>
          {["Position", "Size", "Scale", "Opacity"].map((item, i) => (
            <div key={item} className="border-t border-white/8 py-2 first:border-t-0">
              <div className="mb-1 text-[7px] text-fg-dim">{item}</div>
              <div className="h-1 rounded-full bg-white/10">
                <div 
                  className="h-full rounded-full bg-[var(--accent)] origin-left" 
                  style={{ 
                    width: `${[36, 74, 54, 88][i]}%`,
                    animation: `slider-drift ${3 + i * 0.5}s ease-in-out ${i * 0.7}s infinite alternate`
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function GlassDashboardStack() {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const hero = stack.closest<HTMLElement>("[data-screen-label='00 Hero']");
    if (!hero || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let nextX = 0;
    let nextY = 0;

    const paint = () => {
      raf = 0;
      const rx = (-nextY * 3.2).toFixed(2);
      const ry = (nextX * 4.8).toFixed(2);
      const glowX = (50 + nextX * 18).toFixed(1);
      const glowY = (50 + nextY * 16).toFixed(1);

      stack.style.setProperty("--glass-rx", `${rx}deg`);
      stack.style.setProperty("--glass-ry", `${ry}deg`);
      stack.style.setProperty("--glass-glare-x", `${glowX}%`);
      stack.style.setProperty("--glass-glare-y", `${glowY}%`);
      hero.style.setProperty("--hero-glass-x", `${glowX}%`);
      hero.style.setProperty("--hero-glass-y", `${glowY}%`);
      hero.style.setProperty("--hero-caustic-o", "0.46");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!raf) raf = window.requestAnimationFrame(paint);
    };

    const onPointerLeave = () => {
      nextX = 0;
      nextY = 0;
      hero.style.setProperty("--hero-caustic-o", "0.24");
      if (!raf) raf = window.requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={stackRef} className="hero-dashboard-stack" aria-hidden="true">
      <div className="hero-dashboard-panels-wrapper">
        <MetricsPanel />
        <WorkflowPanel />
        <EditorPanel />
      </div>

      <div className="hero-dashboard-label hero-dashboard-label--one">
        <span />
        <div>01 /<br />Data dashboard</div>
      </div>
      <div className="hero-dashboard-label hero-dashboard-label--two">
        <span />
        <div>02 /<br />AI workflow</div>
      </div>
      <div className="hero-dashboard-label hero-dashboard-label--three">
        <span />
        <div>03 /<br />Visual editor</div>
      </div>
    </div>
  );
}
