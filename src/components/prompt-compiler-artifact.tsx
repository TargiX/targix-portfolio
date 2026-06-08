"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check, GitBranch, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Zone = "subject" | "setting" | "mood" | "aesthetic";

type Node = {
  id: string;
  zone: Zone;
  label: string;
  detail: string;
};

const NODES: Node[] = [
  { id: "guardian", zone: "subject", label: "Guardian", detail: "armored character" },
  { id: "sword", zone: "subject", label: "Glowing Sword", detail: "arcane weapon" },
  { id: "ground", zone: "setting", label: "Rain-Slicked Ground", detail: "reflective wet surface" },
  { id: "alley", zone: "setting", label: "Neon Alley", detail: "cyberpunk location" },
  { id: "light", zone: "mood", label: "Atmospheric Lighting", detail: "volumetric soft rays" },
  { id: "rainy", zone: "mood", label: "Rainy", detail: "weather modifier" },
  { id: "digital", zone: "aesthetic", label: "Digital Art", detail: "render style" },
];

const ZONE_STYLE: Record<Zone, string> = {
  subject: "border-violet-400/50 bg-violet-500/10 text-[var(--zone-subject)]",
  setting: "border-cyan-400/50 bg-cyan-500/10 text-[var(--zone-setting)]",
  mood: "border-amber-400/50 bg-amber-500/10 text-[var(--zone-mood)]",
  aesthetic: "border-emerald-400/50 bg-emerald-500/10 text-[var(--zone-aesthetic)]",
};

const MODEL_STEPS = [
  ["compile", "Build a stable natural-language prompt from selected nodes."],
  ["route", "Pick Nano Banana 2 for fast iteration and square output."],
  ["persist", "Store graph, prompt tags, model params, and generated frames."],
];

export function PromptCompilerArtifact({ compact = false }: { compact?: boolean }) {
  const [disabled, setDisabled] = useState<Set<string>>(new Set(["rainy"]));

  const activeNodes = useMemo(
    () => NODES.filter((node) => !disabled.has(node.id)),
    [disabled],
  );

  const compiledPrompt = useMemo(() => {
    const has = (id: string) => activeNodes.some((node) => node.id === id);
    return [
      has("guardian") && "an armored guardian",
      has("sword") && "wielding a glowing arcane sword",
      has("alley") && "in a neon cyberpunk alley",
      has("ground") && "over rain-slicked reflective ground",
      has("light") && "with atmospheric volumetric lighting",
      has("rainy") && "during heavy rain",
      has("digital") && "rendered as polished digital art",
    ]
      .filter(Boolean)
      .join(", ");
  }, [activeNodes]);

  const promptTags = activeNodes.map((node) => node.label);

  function toggleNode(id: string) {
    setDisabled((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-line-soft bg-bg-2/35",
        compact ? "my-8" : "",
      )}
    >
      <div className="grid gap-px bg-line-soft md:grid-cols-[1.05fr_1fr_0.78fr]">
        <section className="bg-bg p-4">
          <Header icon={<GitBranch className="size-3" />} label="graph input" value="7 nodes" />
          <div className="mt-4 grid gap-2">
            {NODES.map((node) => {
              const isEnabled = !disabled.has(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition",
                    isEnabled
                      ? ZONE_STYLE[node.zone]
                      : "border-line bg-bg-2/30 text-fg-dim hover:text-fg-muted",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">{node.label}</span>
                    <span className="block truncate font-mono text-[10px] opacity-70">
                      {node.detail}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border",
                      isEnabled ? "border-current bg-white/10" : "border-line",
                    )}
                    aria-hidden="true"
                  >
                    {isEnabled && <Check className="size-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-bg p-4">
          <Header icon={<Sparkles className="size-3" />} label="compiled prompt" value="live" />
          <div className="mt-4 rounded-md border border-line bg-bg-2/45 p-4">
            <p className="m-0 font-mono text-[15px] leading-[1.65] text-fg">
              {compiledPrompt || "Select at least one node to compile a prompt."}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {promptTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line bg-bg-2 px-2 py-0.5 font-mono text-[10px] text-fg-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-bg p-4">
          <Header icon={<Zap className="size-3" />} label="run plan" value="20 credits" />
          <ol className="mt-4 space-y-3">
            {MODEL_STEPS.map(([title, body], index) => (
              <li key={title} className="rounded-md border border-line-soft bg-bg-2/35 p-3">
                <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-fg-dim">
                  <span className="text-[var(--accent)]">0{index + 1}</span>
                  {title}
                </div>
                <p className="m-0 text-[12px] leading-[1.55] text-fg-muted">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px] lowercase text-fg-dim">
            <Metric label="model" value="Nano Banana 2" />
            <Metric label="aspect" value="1:1" />
            <Metric label="seed" value="random" />
            <Metric label="frames" value="4" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Header({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
      <span className="inline-flex items-center gap-2">
        <span className="text-[var(--accent)]">{icon}</span>
        {label}
      </span>
      <span className="rounded-full border border-line bg-bg-2 px-2 py-0.5 lowercase tracking-[0.04em]">
        {value}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line-soft bg-bg-2/35 px-2.5 py-2">
      <div className="mb-1 text-fg-dim">{label}</div>
      <div className="truncate text-fg-muted">{value}</div>
    </div>
  );
}
