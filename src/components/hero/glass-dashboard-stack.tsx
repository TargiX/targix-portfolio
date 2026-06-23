"use client";

const workflowNodes = [
  { label: "User input", x: 6, y: 42, w: 18 },
  { label: "AI model", x: 31, y: 30, w: 19 },
  { label: "Orchestrator", x: 29, y: 58, w: 22 },
  { label: "Data enrich", x: 61, y: 29, w: 23 },
  { label: "Validate", x: 62, y: 58, w: 20 },
  { label: "Response", x: 86, y: 44, w: 16 },
];

function MetricsPanel() {
  return (
    <article className="glass-dash-panel glass-dash-panel--metrics">
      <div className="glass-dash-head">
        <span className="glass-dash-dot" />
        <span>Metrics Overview</span>
        <span className="ml-auto text-[8px] text-fg-dim">Last 7 days</span>
      </div>
      <div className="mt-3 grid grid-cols-[72px_minmax(0,1fr)] gap-3">
        <div className="grid gap-2">
          {[
            ["Users", "28.4K", "+12.4%"],
            ["Sessions", "62.7K", "+8.4%"],
            ["Conversion", "3.21%", "+2.1%"],
          ].map(([label, value, delta]) => (
            <div key={label} className="rounded-md border border-white/8 bg-white/[0.035] px-2 py-1.5">
              <div className="text-[7px] text-fg-dim">{label}</div>
              <div className="mt-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[10px] text-fg">{value}</span>
                <span className="text-[7px] text-[var(--accent)]">{delta}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="relative min-h-[124px] overflow-hidden rounded-md border border-white/8 bg-black/10 px-3 py-2">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:36px_28px]" />
          <svg className="relative z-10 h-full w-full" viewBox="0 0 260 124" aria-hidden="true">
            <defs>
              <linearGradient id="metricFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="rgb(var(--accent-rgb))" stopOpacity="0.34" />
                <stop offset="1" stopColor="rgb(var(--accent-rgb))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M4 104 C28 60 42 42 60 76 C82 116 100 38 124 54 C142 66 148 98 170 76 C192 52 206 18 224 34 C238 48 238 88 256 52 L256 124 L4 124 Z"
              fill="url(#metricFill)"
            />
            <path
              d="M4 104 C28 60 42 42 60 76 C82 116 100 38 124 54 C142 66 148 98 170 76 C192 52 206 18 224 34 C238 48 238 88 256 52"
              fill="none"
              stroke="rgb(var(--accent-rgb))"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {[4, 60, 124, 170, 224, 256].map((x, i) => (
              <circle key={x} cx={x} cy={[104, 76, 54, 76, 34, 52][i]} r="3" fill="rgb(var(--accent-rgb))" />
            ))}
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
          <path d="M24 50 H31 M50 39 H61 M50 67 H62 M84 44 H90" stroke="rgba(220,255,235,.55)" strokeWidth=".55" fill="none" />
          <path d="M50 39 C56 39 55 30 61 30 M50 67 C56 67 55 58 62 58 M84 30 C88 30 87 44 90 44 M82 58 C87 58 87 44 90 44" stroke="rgba(220,255,235,.42)" strokeWidth=".45" fill="none" />
        </svg>
        {workflowNodes.map((node) => (
          <div
            key={node.label}
            className="absolute rounded-md border border-[color:color-mix(in_oklab,var(--accent)_36%,white_10%)] bg-[rgba(10,22,19,.72)] px-2 py-1.5 shadow-[0_0_24px_color-mix(in_oklab,var(--accent)_14%,transparent)]"
            style={{ left: `${node.x}%`, top: `${node.y}%`, width: `${node.w}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="h-1.5 w-1.5 rounded-sm bg-[var(--accent)]" />
            <div className="mt-1 truncate text-[7px] text-fg">{node.label}</div>
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
            <path d="M0 126 L42 86 L82 104 L118 54 L166 98 L210 64 L260 88 L320 44 L360 72" fill="none" stroke="rgba(45,212,191,.46)" strokeWidth="2" />
            <path d="M0 146 L54 92 L96 118 L136 74 L178 108 L224 72 L276 98 L328 58 L360 88" fill="none" stroke="rgba(125,249,174,.38)" strokeWidth="1.4" />
            {Array.from({ length: 7 }, (_, i) => (
              <path key={i} d={`M0 ${138 - i * 8} C80 ${98 - i * 9} 108 ${154 - i * 7} 178 ${102 - i * 5} S286 ${72 + i * 6} 360 ${82 - i * 4}`} fill="none" stroke="rgba(125,249,174,.12)" strokeWidth="1" />
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
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${[36, 74, 54, 88][i]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function GlassDashboardStack() {
  return (
    <div className="hero-dashboard-stack" aria-hidden="true">
      <MetricsPanel />
      <WorkflowPanel />
      <EditorPanel />

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
