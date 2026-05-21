"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { motion, AnimatePresence } from "motion/react";
import { Play } from "lucide-react";

import "@xyflow/react/dist/style.css";
import "./phosphene-demo.css";

import { cn } from "@/lib/utils";

type PipelineKind = "prompt" | "transform" | "generate" | "output";

type PipelineNodeData = {
  label: string;
  kind: PipelineKind;
  hint?: string;
  active: boolean;
};

type PipelineNode = Node<PipelineNodeData, "pipeline">;

const KIND_GLYPH: Record<PipelineKind, string> = {
  prompt: "✎",
  transform: "↻",
  generate: "✦",
  output: "▣",
};

function PipelineNodeView({ data }: NodeProps<PipelineNode>) {
  const { label, kind, hint, active } = data;
  return (
    <div
      className={cn(
        "pf-node group/node relative flex w-[120px] flex-col gap-1 rounded-md border bg-[var(--bg-2)] px-2.5 py-2 font-mono text-[11px] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-colors",
        active
          ? "border-[var(--accent)] text-[var(--fg)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_18%,transparent)]"
          : "border-[var(--line)] text-[var(--fg-muted)]",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex size-3.5 items-center justify-center rounded-sm border text-[9px] leading-none",
            active
              ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--accent)]"
              : "border-[var(--line)] text-[var(--fg-dim)]",
          )}
        >
          {KIND_GLYPH[kind]}
        </span>
        <span className="text-[var(--fg)]">{label}</span>
      </div>
      {hint && (
        <div className="truncate text-[9px] tracking-wide text-[var(--fg-dim)]">{hint}</div>
      )}

      <Handle type="target" position={Position.Left} className="pf-handle" />
      <Handle type="source" position={Position.Right} className="pf-handle" />
    </div>
  );
}

const INITIAL_NODES: PipelineNode[] = [
  {
    id: "prompt",
    type: "pipeline",
    position: { x: 0, y: 60 },
    data: { kind: "prompt", label: "prompt", hint: "moody portrait", active: false },
  },
  {
    id: "transform",
    type: "pipeline",
    position: { x: 150, y: 60 },
    data: { kind: "transform", label: "transform", hint: "+ style ref", active: false },
  },
  {
    id: "generate",
    type: "pipeline",
    position: { x: 300, y: 60 },
    data: { kind: "generate", label: "generate", hint: "fal · flux", active: false },
  },
  {
    id: "output",
    type: "pipeline",
    position: { x: 450, y: 60 },
    data: { kind: "output", label: "output", hint: "2048×2048", active: false },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1", source: "prompt", target: "transform", animated: true, type: "smoothstep" },
  { id: "e2", source: "transform", target: "generate", animated: true, type: "smoothstep" },
  { id: "e3", source: "generate", target: "output", animated: true, type: "smoothstep" },
];

const NODE_TYPES = { pipeline: PipelineNodeView };

const STEP_ORDER: PipelineKind[] = ["prompt", "transform", "generate", "output"];
const STEP_MS = 480;

export function PhospheneDemo() {
  const [nodes, , onNodesChange] = useNodesState<PipelineNode>(INITIAL_NODES);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);

  // Mark nodes active during a run — derived state from activeStep
  const liveNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          active: isRunning && STEP_ORDER.indexOf(n.data.kind) <= activeStep,
        },
      })),
    [nodes, isRunning, activeStep],
  );

  const run = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(0);
    let step = 0;
    const tick = () => {
      step++;
      if (step < STEP_ORDER.length) {
        setActiveStep(step);
        setTimeout(tick, STEP_MS);
      } else {
        // hold final frame, then reset
        setTimeout(() => {
          setIsRunning(false);
          setActiveStep(-1);
        }, 900);
      }
    };
    setTimeout(tick, STEP_MS);
  }, [isRunning]);

  // Auto-run once shortly after mount so the demo "performs itself"
  useEffect(() => {
    const id = setTimeout(run, 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pf-wrap relative h-[220px] w-full">
      <ReactFlow
        nodes={liveNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="oklch(0.30 0.005 250)"
        />
      </ReactFlow>

      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.08em] text-[var(--fg-dim)]">
        <span className="size-1.5 rounded-full bg-[var(--accent)] opacity-80" />
        <span>
          live · {isRunning ? STEP_ORDER[Math.max(activeStep, 0)] : "ready"}
        </span>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={isRunning}
        className={cn(
          "group/run absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] transition-all",
          isRunning
            ? "border-[var(--line)] text-[var(--fg-dim)]"
            : "border-[var(--line)] bg-[var(--bg-2)]/80 text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:translate-y-px",
        )}
        aria-label="Run pipeline"
      >
        <Play
          className="size-3 transition-transform group-hover/run:scale-110"
          fill="currentColor"
        />
        <span>{isRunning ? "running…" : "run"}</span>
      </button>

      <AnimatePresence>
        {isRunning && activeStep === STEP_ORDER.length - 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="rounded-md border border-[color:color-mix(in_oklab,var(--accent)_45%,var(--line))] bg-[var(--bg-2)]/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] text-[var(--fg)] backdrop-blur-sm">
              ✓ pipeline complete
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhospheneDemo;
