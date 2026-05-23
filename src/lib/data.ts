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
};

export const FEATURED: Project = {
  index: "①",
  year: "2024 — now",
  role: "Solo founder · Design + Eng",
  title: "Phosphene",
  blurb:
    "A graph-based prompt workflow for image generation. Designers wire prompts, transforms, and models into a node graph and run the whole pipeline — instead of chatting one prompt at a time.",
  tags: ["Nuxt 4", "tRPC", "Prisma", "Postgres", "Three.js", "fal.ai", "Gemini", "Paddle"],
  links: [
    { label: "phosphene.cc", href: "https://phosphene.cc" },
    { label: "case study", href: "/work/phosphene" },
  ],
  featured: true,
  caseSlug: "phosphene",
};

export const SECONDARY: Project[] = [
  {
    index: "②",
    year: "2021 — 2026",
    role: "Lead Frontend · AppDirect (MSC)",
    title: "AppDirect",
    blurb:
      "Nearly five years leading frontend in AppDirect's Managed Services division — running the team, mentoring juniors, and setting frontend direction while shipping a steady stream of products across Broker Online Exchange's telecom-quoting platform (Vue 3 + TypeScript over a Yii backend). Flagship: Bill Scan → Quote, which turns scanned telecom bills into structured quotes via Gemini Vision OCR.",
    tags: ["Vue 3", "TypeScript", "Yii", "Gemini Vision", "Team lead", "Mentoring"],
    links: [
      { label: "brokeronlinexchange.com", href: "https://www.brokeronlinexchange.com/" },
      { label: "case study", href: "/work/appdirect" },
    ],
    caseSlug: "appdirect",
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
      { label: "live app", href: "https://anchor-ritual.vercel.app" },
      { label: "case study", href: "/work/anchor" },
    ],
    caseSlug: "anchor",
  },
  {
    index: "④",
    year: "2022",
    role: "Solo · weekend",
    title: "Project Four",
    blurb:
      "Another slot. Smaller side projects work great here — open source, tooling, demos, anything you'd be proud to show on call one.",
    tags: ["TBD"],
    links: [{ label: "github", href: "https://github.com/TargiX" }],
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
  { key: "linkedin", label: "linkedin.com/in/ilya-moskovkin", href: "https://www.linkedin.com/in/" },
];
