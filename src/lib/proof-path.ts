export type ProofModeId = "operator" | "ai" | "ownership";

export type ProofStop = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  action: string;
  evidence: string;
};

export type ProofMode = {
  id: ProofModeId;
  label: string;
  detail: string;
  outcome: string;
  intro: string;
  stops: readonly ProofStop[];
};

export const PROOF_MODES: readonly ProofMode[] = [
  {
    id: "operator",
    label: "Dashboards and operator workflows",
    detail: "B2B SaaS, dense data, permissions, and daily-use tools.",
    outcome: "Dashboards and operator workflows",
    intro:
      "Broker Online Exchange shows long-term production ownership. SignalOps and Roomboard cover incident response and collaborative review.",
    stops: [
      {
        eyebrow: "01 · B2B SaaS",
        title: "Broker Online Exchange",
        description:
          "I led the frontend for nearly five years. The case study covers quoting, dashboards, complex forms, a design-system migration, and bill extraction.",
        href: "/work/broker-online-exchange",
        action: "Open case study",
        evidence: "Lead frontend · B2B SaaS · 2021–2026",
      },
      {
        eyebrow: "02 · incident response",
        title: "SignalOps",
        description:
          "I built a working incident dashboard with provider health, 10,000 virtualized jobs, guided replay, and routing controls.",
        href: "/work/signalops",
        action: "Open case study",
        evidence: "Next.js · TanStack Virtual · Recharts",
      },
      {
        eyebrow: "03 · visual review",
        title: "Roomboard",
        description:
          "I designed and built a private canvas for visual review, with rooms, roles, comments, and review states.",
        href: "/work/roomboard",
        action: "Open case study",
        evidence: "Next.js · PixiJS · realtime rooms",
      },
    ],
  },
  {
    id: "ai",
    label: "AI features with review built in",
    detail: "Generation, extraction, retries, and human correction.",
    outcome: "AI features with review built in",
    intro:
      "Phosphene covers a complete AI product. Broker shows bill extraction inside a B2B workflow. SignalOps covers the operations behind generation.",
    stops: [
      {
        eyebrow: "01 · image generation",
        title: "Phosphene",
        description:
          "I run this product end to end. Users start from templates, generate images, and can move into graph-based tools when they need more control.",
        href: "/work/phosphene",
        action: "Open case study",
        evidence: "Nuxt 4 · image generation · payments",
      },
      {
        eyebrow: "02 · bill extraction",
        title: "Broker Online Exchange",
        description:
          "I added Gemini Vision bill extraction to the quoting flow. Brokers could review uncertain fields, correct them, and keep the source document.",
        href: "/work/broker-online-exchange",
        action: "Open case study",
        evidence: "Gemini Vision · Vue · human review",
      },
      {
        eyebrow: "03 · infrastructure",
        title: "SignalOps",
        description:
          "A working dashboard for provider health, generation failures, incident replay, and traffic routing.",
        href: "/work/signalops",
        action: "Open case study",
        evidence: "Provider health · routing · incident replay",
      },
    ],
  },
  {
    id: "ownership",
    label: "Products I designed and built",
    detail: "Product decisions, interaction design, engineering, and release.",
    outcome: "Products I designed and built",
    intro:
      "Three independent products where I made both the product and engineering decisions.",
    stops: [
      {
        eyebrow: "01 · Phosphene",
        title: "Phosphene",
        description:
          "I chose the product shape, designed the interfaces, built the app and backend, integrated billing, and operate the service.",
        href: "/work/phosphene",
        action: "Open case study",
        evidence: "Product design · Nuxt 4 · operations",
      },
      {
        eyebrow: "02 · Anchor",
        title: "Anchor",
        description:
          "I designed and built a daily-ritual app for web, iOS, Android, and desktop from one Next.js codebase.",
        href: "/work/anchor",
        action: "Open case study",
        evidence: "Next.js · Capacitor · Electron",
      },
      {
        eyebrow: "03 · Roomboard",
        title: "Roomboard",
        description:
          "I designed the review flow and built the realtime canvas, room permissions, comments, and sharing.",
        href: "/work/roomboard",
        action: "Open case study",
        evidence: "Product design · PixiJS · realtime rooms",
      },
    ],
  },
];

export function getProofMode(id: string | null | undefined): ProofMode {
  return PROOF_MODES.find((mode) => mode.id === id) ?? PROOF_MODES[0];
}
