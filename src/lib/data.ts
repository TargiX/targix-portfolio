import { ANCHOR_DEPLOYED, ANCHOR_REPO_URL, ANCHOR_URL } from "@/lib/project-links";

export type CaseLink = { label: string; href: string };

export type Project = {
  index: string;
  year: string;
  role: string;
  title: string;
  blurb: string;
  tags: string[];
  links: CaseLink[];
  /** When present, the case-study link is wired to /work/<slug>. */
  caseSlug?: string;
  /** Small preview image shown beside the text on the home page card. */
  thumb?: string;
  /** Screens splayed as a fan in the media stage (mobile-style projects). */
  screens?: string[];
  /** Renders a live interactive demo in the media stage instead of images. */
  demo?: "phosphene" | "roomboard" | "broker";
};

// Three kinds of proof, in hiring order: production leadership, founder-level
// ownership, and an independent product with a distinct interaction model.
export const FEATURED: Project[] = [
  {
    index: "①",
    year: "2021 – 2026",
    role: "Production · Lead Frontend",
    title: "Broker Online Exchange",
    blurb:
      "Nearly five years leading frontend for a private B2B energy platform through an acquisition: dense workflows, an incremental design-system re-theme, team patterns, and an AI-assisted bill-to-quote flow.",
    tags: ["Vue 3", "React", "Design systems", "Complex SaaS", "AI review", "Team lead"],
    links: [
      { label: "public company site", href: "https://www.brokeronlinexchange.com/" },
      { label: "case study", href: "/work/broker-online-exchange" },
    ],
    caseSlug: "broker-online-exchange",
    thumb: "/work/broker/banner.webp",
  },
  {
    index: "②",
    year: "2026 – now",
    role: "Founder-led · Design + Engineering",
    title: "Phosphene",
    blurb:
      "A shipped AI image product I own end to end. Templates make generation approachable; graph and workflow tools preserve depth for advanced users.",
    tags: ["Nuxt 4", "Vue 3", "AI workflows", "Product design", "Postgres", "Payments"],
    links: [
      { label: "phosphene.cc", href: "https://phosphene.cc" },
      { label: "case study", href: "/work/phosphene" },
    ],
    caseSlug: "phosphene",
    thumb: "/work/phosphene/phosphene-landing-showcase.jpg",
  },
  {
    index: "③",
    year: "2025",
    role: "Independent product · Design + Engineering",
    title: "Roomboard",
    blurb:
      "A private visual decision room for landing-page reviews and moodboards, with roles, comments, review states, and a realtime canvas built around closing feedback loops.",
    tags: ["Next.js", "React", "Pixi.js", "Realtime", "Permissions", "Canvas UX"],
    links: [
      { label: "roomboard.online", href: "https://roomboard.online" },
      { label: "case study", href: "/work/roomboard" },
    ],
    caseSlug: "roomboard",
    thumb: "/work/roomboard/landing-hero.png",
    demo: "roomboard",
  },
];

// Secondary proof stays useful but visually distinct from the three core cases.
// Concept-only builds live in the lab rather than competing with shipped work.
export const MORE: Project[] = [
  {
    index: "④",
    year: "2025",
    role: "Independent system · React",
    title: "SignalOps",
    blurb:
      "An operations cockpit for AI generation infrastructure: provider health, incident replay, virtualized jobs, and routing decisions.",
    links: [
      { label: "signalops.cc", href: "https://signalops.cc" },
      { label: "github", href: "https://github.com/TargiX/signalops" },
      { label: "case study", href: "/work/signalops" },
    ],
    tags: ["Next.js", "React", "Virtualized data", "Recharts"],
    caseSlug: "signalops",
    thumb: "/work/signalops/cockpit.png",
  },
  {
    index: "⑤",
    year: "2026 – now",
    role: "Independent product · Cross-platform",
    title: "Anchor",
    blurb:
      "A calm daily-ritual product shipped from one Next.js codebase to web, iOS, Android, and desktop.",
    tags: ["Next.js", "React", "Capacitor", "Electron"],
    links: [
      ...(ANCHOR_DEPLOYED ? [{ label: "anchorapp.cc", href: ANCHOR_URL }] : []),
      { label: "github", href: ANCHOR_REPO_URL },
      { label: "case study", href: "/work/anchor" },
    ],
    caseSlug: "anchor",
    thumb: "/work/anchor/anchor-laptop-hero.jpg",
  },
  {
    index: "⑥",
    year: "2026",
    role: "Full-stack product build · Vue",
    title: "TalentSignal",
    blurb:
      "A compact HR discovery workspace for matching profiles, reviewing compatibility, messaging, and trust workflows.",
    tags: ["Nuxt 4", "Vue 3", "NestJS", "Search"],
    links: [
      { label: "live demo", href: "https://talentsignal.us" },
      { label: "github", href: "https://github.com/TargiX/TalentSignal" },
      { label: "case study", href: "/work/talentsignal" },
    ],
    caseSlug: "talentsignal",
    thumb: "/work/talentsignal/discover-desktop.png",
  },
  {
    index: "⑦",
    year: "2023 – 2026",
    role: "Independent system · Trading UI",
    title: "Injective Trading Terminal",
    blurb:
      "A Nuxt trading terminal for the Injective testnet with wallet state, live markets, order book, and candlestick charts.",
    tags: ["Nuxt 3", "TypeScript", "Trading UI", "gRPC-web"],
    links: [
      { label: "live app", href: "https://injective.ilyamoskovkin.com" },
      { label: "github", href: "https://github.com/TargiX/injective-testnet-dapp" },
    ],
    thumb: "/work/injective/dashboard-dark.png",
  },
];

export const STACK = [
  {
    label: "core",
    items: [
      "TypeScript",
      "React 19 / Next.js (App Router)",
      "TanStack Query · Zustand",
      "Vue 3 / Nuxt 4",
      "Node.js",
    ],
  },
  {
    label: "data & infra",
    items: [
      "Postgres / Prisma",
      "Redis",
      "tRPC / REST",
      "GraphQL / Apollo",
      "Stripe · Paddle · Creem",
      "AWS · S3 · Hetzner · Vercel",
    ],
  },
  {
    label: "craft",
    items: ["Figma · UX research", "Tailwind · shadcn", "Three.js · Pixi.js", "Sentry · PostHog"],
  },
];

export const CONTACT = [
  { key: "email", label: "hello@ilyamoskovkin.com", href: "mailto:hello@ilyamoskovkin.com" },
  { key: "github", label: "github.com/TargiX", href: "https://github.com/TargiX" },
  {
    key: "linkedin",
    label: "linkedin.com/in/ilya-moskovkin",
    href: "https://www.linkedin.com/in/ilya-moskovkin-963ab85b/",
  },
  { key: "résumé", label: "Ilya_Moskovkin_CV.pdf", href: "/Ilya_Moskovkin_CV.pdf" },
] as const;
