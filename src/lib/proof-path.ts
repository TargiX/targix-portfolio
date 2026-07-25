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
    label: "Complex operator surface",
    detail: "Dense workflows, real decisions, and repeatable controls.",
    outcome: "A three-stop path through high-signal business UI.",
    intro:
      "Start with the private B2B system, then inspect the incident cockpit and collaborative decision room.",
    stops: [
      {
        eyebrow: "01 · business workflow",
        title: "Broker Online Exchange",
        description:
          "Five years of frontend ownership across quoting, dashboards, bill scan-to-quote, and a private B2B platform.",
        href: "/work/broker-online-exchange",
        action: "Open case study",
        evidence: "Complex forms · data density · design-system leadership",
      },
      {
        eyebrow: "02 · operational decision",
        title: "SignalOps",
        description:
          "An incident cockpit where provider health, affected jobs, and routing decisions stay legible under pressure.",
        href: "/work/signalops",
        action: "Open case study",
        evidence: "Virtualized data · guided replay · operator UX",
      },
      {
        eyebrow: "03 · collaborative control",
        title: "Roomboard",
        description:
          "A private visual decision room for creative review, roles, comments, and closing feedback loops.",
        href: "/work/roomboard",
        action: "Open case study",
        evidence: "Realtime collaboration · canvas UX · permissions",
      },
    ],
  },
  {
    id: "ai",
    label: "AI workflow that lands",
    detail: "Generation, correction, review, and useful product boundaries.",
    outcome: "A proof path for AI that is more than a chatbot demo.",
    intro:
      "See a template-first generation product, a real extraction-to-review workflow, and the operations layer around AI systems.",
    stops: [
      {
        eyebrow: "01 · creator workflow",
        title: "Phosphene",
        description:
          "A template-first AI image product that starts with outcomes and only exposes deeper graph tooling when needed.",
        href: "/work/phosphene",
        action: "Open case study",
        evidence: "AI generation · graph tools · product judgment",
      },
      {
        eyebrow: "02 · human review",
        title: "Broker Online Exchange",
        description:
          "Gemini Vision bill scan-to-quote work inside a production-facing B2B workflow rather than an isolated model demo.",
        href: "/work/broker-online-exchange",
        action: "Open case study",
        evidence: "Extraction · correction states · production UI",
      },
      {
        eyebrow: "03 · system operations",
        title: "SignalOps",
        description:
          "A focused interface for monitoring AI generation infrastructure and making routing choices with visible trade-offs.",
        href: "/work/signalops",
        action: "Open case study",
        evidence: "Provider health · routing rules · failure-aware UI",
      },
    ],
  },
  {
    id: "ownership",
    label: "From product shape to shipped surface",
    detail: "Design judgment, implementation depth, and delivery responsibility.",
    outcome: "A fast route through independent product ownership.",
    intro:
      "Follow three products where the interface is inseparable from the product decision, not a layer added after the fact.",
    stops: [
      {
        eyebrow: "01 · AI product",
        title: "Phosphene",
        description:
          "Solo founder work spanning product positioning, template UX, AI generation, deeper creator tooling, and the shipped service.",
        href: "/work/phosphene",
        action: "Open case study",
        evidence: "Product design · frontend · backend boundaries",
      },
      {
        eyebrow: "02 · cross-platform habit product",
        title: "Anchor",
        description:
          "A calm daily-ritual product from one Next.js codebase across web, mobile, and desktop delivery targets.",
        href: "/work/anchor",
        action: "Open case study",
        evidence: "Interaction design · platform delivery · product continuity",
      },
      {
        eyebrow: "03 · visual collaboration product",
        title: "Roomboard",
        description:
          "A focused collaboration system that turns subjective visual feedback into an owned, reviewable decision loop.",
        href: "/work/roomboard",
        action: "Open case study",
        evidence: "Product strategy · realtime UX · visual systems",
      },
    ],
  },
];

export function getProofMode(id: string | null | undefined): ProofMode {
  return PROOF_MODES.find((mode) => mode.id === id) ?? PROOF_MODES[0];
}
