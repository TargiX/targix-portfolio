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
  featured?: boolean;
  /** When present, the case-study link is wired to /work/<slug>. */
  caseSlug?: string;
  /** Small preview image shown beside the text on the home page card. */
  thumb?: string;
  /** Screens splayed as a fan in the media stage (mobile-style projects). */
  screens?: string[];
  /** Renders a live interactive demo in the media stage instead of images. */
  demo?: "phosphene" | "roomboard" | "broker";
};

export const FEATURED: Project = {
  index: "①",
  year: "2024 — now",
  role: "Solo founder · Design + Eng",
  title: "Phosphene",
  blurb:
    "A visual prompt workspace for image generation. Users compose zones, references, models, templates, and generated outputs without losing the structure behind the prompt.",
  tags: ["Nuxt 4", "Vue 3", "tRPC", "Prisma", "Postgres", "D3", "Vue Flow", "fal.ai", "Gemini", "Paddle"],
  links: [
    { label: "phosphene.cc", href: "https://phosphene.cc" },
    { label: "case study", href: "/work/phosphene" },
  ],
  featured: true,
  caseSlug: "phosphene",
  demo: "phosphene",
};

export const SECONDARY: Project[] = [
  {
    index: "②",
    year: "2021 — 2026",
    role: "Lead Frontend · Broker Online Exchange",
    title: "Broker Online Exchange",
    blurb:
      "Nearly five years leading the frontend team at Broker Online Exchange (acquired by AppDirect along the way). Mentored juniors and built MyServiceCloud, a B2B energy-brokerage platform, then led the migration from Vue 3 to React micro-frontends (Mantine, Zustand). Flagship: Bill Scan → Quote — scanned bills turned into structured quotes via Gemini Vision OCR.",
    tags: ["React", "Vue 3", "TypeScript", "Micro-frontends", "Mantine", "Zustand", "Laravel", "Team lead"],
    links: [
      { label: "brokeronlinexchange.com", href: "https://www.brokeronlinexchange.com/" },
      { label: "case study", href: "/work/broker-online-exchange" },
    ],
    caseSlug: "broker-online-exchange",
    demo: "broker",
  },
  {
    index: "③",
    year: "2026 — now",
    role: "Solo · Design + Eng",
    title: "Anchor",
    blurb:
      "A calm daily-ritual app — mood, sleep, intention, journaling. A real hybrid app launching now: one Next.js codebase shipping to web, iOS/Android (Capacitor), and desktop (Electron).",
    tags: ["Next.js 16", "React 19", "Capacitor", "Electron", "Framer Motion"],
    links: [
      ...(ANCHOR_DEPLOYED ? [{ label: "live app", href: ANCHOR_URL }] : []),
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
  {
    index: "④",
    year: "2025",
    role: "Solo · Product Design + Eng",
    title: "Roomboard",
    blurb:
      "A live realtime collaboration room for moodboards, landing-page reviews, and creative decisions — open at roomboard.online. Drop images, write notes, add comments, link cards, and share one lockable room URL.",
    tags: ["Next.js 16", "React 19", "Pixi.js", "Elixir/Phoenix", "Supabase", "Realtime", "Canvas UX"],
    links: [
      { label: "roomboard.online", href: "https://roomboard.online" },
      { label: "case study", href: "/work/roomboard" },
    ],
    caseSlug: "roomboard",
    thumb: "/work/roomboard/landing-hero.png",
    demo: "roomboard",
  },
];

/**
 * Smaller side-projects — rendered below "Selected Work" as a compact
 * tier (the "more work" band). The section only renders when this array is
 * non-empty, so it stays hidden until you add real entries here.
 *
 * To bring it back: push Project objects into this array (same shape as
 * SECONDARY above) and the band appears automatically.
 */
export const MINOR: Project[] = [
  {
    index: "⑤",
    year: "2024",
    role: "Solo · React systems",
    title: "SignalOps",
    blurb:
      "A React operations cockpit for AI generation infrastructure: provider health, incident drill-down, virtualized job inspection, and routing-rule simulation.",
    tags: ["Next.js 16", "React 19", "TanStack Table", "TanStack Virtual", "Recharts"],
    links: [{ label: "case study", href: "/work/signalops" }],
    caseSlug: "signalops",
    thumb: "/work/signalops/incident.png",
  },
  {
    index: "⑥",
    year: "2025",
    role: "Solo · CMS marketing build",
    title: "Flux Sanity Site",
    blurb:
      "A marketing site on Next.js App Router with Sanity: reusable section schemas, draft preview wiring, technical SEO, and Vercel deployment.",
    tags: ["Next.js 16", "Sanity", "Headless CMS", "Technical SEO", "Vercel"],
    links: [
      { label: "live site", href: "https://sanity.ilyamoskovkin.com" },
      { label: "case study", href: "/work/flux-sanity-site" },
    ],
    caseSlug: "flux-sanity-site",
    thumb: "/work/flux-sanity/homepage.png",
  },
  {
    index: "⑦",
    year: "2026",
    role: "Solo · Astro SSG",
    title: "HelixCare Pulse",
    blurb:
      "A dark, premium healthcare marketing site built in Astro: static output, section-driven data, reusable components, and tiny vanilla-JS interactions.",
    tags: ["Astro", "SSG", "Vanilla JS", "Netlify"],
    links: [{ label: "live demo", href: "https://helixcare-pulse.vercel.app" }],
    thumb: "/work/helixcare-pulse/hero-device.png",
  },
  {
    index: "⑧",
    year: "2023",
    role: "Solo · Web3 / Cosmos",
    title: "Injective Testnet dApp",
    blurb:
      "A Nuxt/TypeScript dApp on the Injective (Cosmos) testnet: wallet connect (Keplr/Leap), on-chain balances, and a live spot order book with hand-rolled price and depth charts — all read over the injective-ts gRPC-web SDK.",
    tags: ["Nuxt 3", "TypeScript", "Injective / Cosmos", "gRPC-web", "Keplr"],
    links: [
      { label: "live demo", href: "https://injective.ilyamoskovkin.com" },
      { label: "github", href: "https://github.com/TargiX/injective-testnet-dapp" },
    ],
    thumb: "/work/injective/dashboard.png",
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
