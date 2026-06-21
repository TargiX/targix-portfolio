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

// The strongest hiring proof first: a real B2B platform led for ~5 years, a
// dense React/data-heavy cockpit, the AI product, and a shipped cross-platform
// side product. Everything else drops to the lighter "More work" tier below.
export const FEATURED: Project[] = [
  {
    index: "①",
    year: "2021 – 2026",
    role: "Lead Frontend · Broker Online Exchange",
    title: "Broker Online Exchange",
    blurb:
      "Nearly five years leading the frontend team at Broker Online Exchange (acquired by AppDirect along the way). Mentored juniors and built MyServiceCloud, a B2B energy-brokerage platform, then led a full design-system re-theme to AppDirect's design language (Mantine) and built new feature areas in React. Flagship: Bill Scan to Quote, scanned bills turned into structured quotes via Gemini Vision OCR.",
    tags: ["Vue 3", "React", "TypeScript", "Design systems", "Mantine", "Zustand", "Laravel", "Team lead"],
    links: [
      { label: "brokeronlinexchange.com", href: "https://www.brokeronlinexchange.com/" },
      { label: "case study", href: "/work/broker-online-exchange" },
    ],
    caseSlug: "broker-online-exchange",
    demo: "broker",
  },
  {
    index: "②",
    year: "2025",
    role: "Solo · React systems",
    title: "SignalOps",
    blurb:
      "An operations cockpit for AI generation infrastructure: provider health monitoring, incident drill-down with guided replay, virtualized job inspection, and routing-rule simulation. A focused data product built to show how frontend craft serves operational decisions — not just dashboards.",
    tags: ["Next.js 16", "React 19", "TanStack Table", "TanStack Virtual", "Recharts", "TypeScript"],
    links: [
      { label: "signalops.cc", href: "https://signalops.cc" },
      { label: "github", href: "https://github.com/TargiX/signalops" },
      { label: "case study", href: "/work/signalops" },
    ],
    caseSlug: "signalops",
    thumb: "/work/signalops/cockpit.png",
  },
  {
    index: "③",
    year: "2026 – now",
    role: "Solo founder · Design + Eng",
    title: "Phosphene",
    blurb:
      "A template-first AI image product. Users pick a curated outcome, add references or small tweaks, generate results, then open deeper graph and workflow tools only when they need them.",
    tags: ["Nuxt 4", "Vue 3", "tRPC", "Prisma", "Postgres", "Templates", "D3", "Vue Flow", "fal.ai", "Gemini", "Paddle"],
    links: [
      { label: "phosphene.cc", href: "https://phosphene.cc" },
      { label: "case study", href: "/work/phosphene" },
    ],
    caseSlug: "phosphene",
    demo: "phosphene",
  },
  {
    index: "④",
    year: "2026 – now",
    role: "Solo · Design + Eng",
    title: "Anchor",
    blurb:
      "A calm daily-ritual app for mood, sleep, intention, and journaling. Live at anchorapp.cc, built from one Next.js codebase that ships to web, iOS/Android (Capacitor), and desktop (Electron).",
    tags: ["Next.js 16", "React 19", "Capacitor", "Electron", "Framer Motion"],
    links: [
      ...(ANCHOR_DEPLOYED ? [{ label: "anchorapp.cc", href: ANCHOR_URL }] : []),
      { label: "github", href: ANCHOR_REPO_URL },
      { label: "case study", href: "/work/anchor" },
    ],
    caseSlug: "anchor",
    thumb: "/work/anchor/dashboard.png",
    screens: [
      "/work/anchor/landing.png",
      "/work/anchor/dashboard.png",
      "/work/anchor/sleep.png",
      "/work/anchor/evening.png",
    ],
  },
];

// Lighter tier: still real, but lower hiring weight. A 4-col compact grid so
// they don't visually compete with the four featured cards above.
export const MORE: Project[] = [
  {
    index: "⑤",
    year: "2026",
    role: "Demo · Full-stack portfolio build",
    title: "TalentSignal",
    blurb:
      "A compact HR/social discovery workspace for matching profiles, reviewing compatibility, sending signals, and handling trust workflows across a Nuxt frontend and NestJS API.",
    tags: ["Nuxt 4", "Vue 3", "NestJS", "MySQL", "Redis", "DynamoDB", "OpenSearch"],
    links: [
      { label: "live demo", href: "https://charforge-web.vercel.app" },
      { label: "github", href: "https://github.com/TargiX/talentsignal-demo" },
      { label: "api docs", href: "https://charforge-api.vercel.app/docs" },
      { label: "case study", href: "/work/talentsignal" },
    ],
    caseSlug: "talentsignal",
    thumb: "/work/talentsignal/discover-desktop.png",
  },
  {
    index: "⑥",
    year: "2025",
    role: "Solo · Product Design + Eng",
    title: "Roomboard",
    blurb:
      "A live realtime collaboration room for moodboards, landing-page reviews, and creative decisions, open at roomboard.online. Drop images, write notes, add comments, link cards, and share one lockable room URL.",
    tags: ["Next.js 16", "React 19", "Pixi.js", "Elixir/Phoenix", "Supabase", "Realtime", "Canvas UX"],
    links: [
      { label: "roomboard.online", href: "https://roomboard.online" },
      { label: "case study", href: "/work/roomboard" },
    ],
    caseSlug: "roomboard",
    thumb: "/work/roomboard/landing-hero.png",
    demo: "roomboard",
  },
  {
    index: "⑦",
    year: "2026",
    role: "Solo · Fictional concept demo",
    title: "HelixCare Pulse",
    blurb:
      "A fictional healthcare SaaS marketing concept — no real clients, metrics, or compliance claims. Dark, premium landing built in Astro to test section-driven, static-output storytelling around a high-impact product visual.",
    tags: ["Astro", "SSG", "Premium B2B", "Healthcare", "Responsive UI", "Vercel"],
    links: [{ label: "live demo", href: "https://helixcare-pulse.vercel.app" }],
    thumb: "/work/helixcare-pulse/hero-device.png",
  },
  {
    index: "⑧",
    year: "2023 – 2026",
    role: "Solo · Web3 trading UI",
    title: "Injective Trading Terminal",
    blurb:
      "A Nuxt/TypeScript trading terminal for the Injective testnet: wallet connect, account balances, live spot markets, an order book, candlestick charts, and gRPC-web data over injective-ts.",
    tags: ["Nuxt 3", "TypeScript", "Injective / Cosmos", "gRPC-web", "Trading UI", "Keplr"],
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
];
