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
      "Nearly five years leading the frontend team at Broker Online Exchange (acquired by AppDirect along the way). Mentored juniors and built MyServiceCloud, a telecom-quoting platform, then led the migration from Vue 3 to React micro-frontends (Mantine, Zustand). Flagship: Bill Scan → Quote — scanned bills turned into structured quotes via Gemini Vision OCR.",
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
    year: "2026",
    role: "Solo · Design + Eng",
    title: "Anchor",
    blurb:
      "A calm daily-ritual app — mood, sleep, intention, journaling. One Next.js codebase shipping to web, iOS/Android (Capacitor), and desktop (Electron).",
    tags: ["Next.js 16", "React 19", "Capacitor", "Electron", "Framer Motion"],
    links: [
      // TODO: once Anchor is deployed, swap this to { label: "live app", href: ANCHOR_URL }
      { label: "github", href: "https://github.com/TargiX/Next.js-Tether" },
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
    year: "2026",
    role: "Solo · Design + Eng",
    title: "Roomboard",
    blurb:
      "A realtime visual collaboration room for moodboards, landing-page reviews, and creative decisions. Drop images, write notes, add comments, link cards, and share one lockable room URL.",
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

export const STACK = [
  {
    label: "core",
    items: ["TypeScript", "Vue 3 / Nuxt 4", "React / Next.js", "Node.js"],
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
  { key: "email", label: "ilya@phosphene.cc", href: "mailto:ilya@phosphene.cc" },
  { key: "github", label: "github.com/TargiX", href: "https://github.com/TargiX" },
  {
    key: "linkedin",
    label: "linkedin.com/in/ilya-moskovkin",
    href: "https://www.linkedin.com/in/ilya-moskovkin",
  },
  { key: "résumé", label: "Ilya_Moskovkin_CV.pdf", href: "/Ilya_Moskovkin_CV.pdf" },
];
