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
    year: "2022 — 2024",
    role: "Senior Frontend · AppDirect MSC",
    title: "Bill Scan → Quote",
    blurb:
      "Rebuilt the flow that turns scanned telecom bills into structured quotes — Vue 3 + Yii, Gemini Vision for OCR. Pulled unit-test coverage from 28% → 68% while shipping.",
    tags: ["Vue 3", "TypeScript", "Yii", "Gemini Vision"],
    links: [{ label: "appdirect.com", href: "https://appdirect.com" }],
  },
  {
    index: "③",
    year: "2023",
    role: "Design Engineer · concept",
    title: "Project Three",
    blurb:
      "Slot for your third case. Drop a one-line problem statement, what you built, and one number that makes a hiring manager pause.",
    tags: ["TBD"],
    links: [{ label: "case study", href: "#" }],
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
  { key: "email", label: "targix@phosphene.cc", href: "mailto:targix@phosphene.cc" },
  { key: "github", label: "github.com/TargiX", href: "https://github.com/TargiX" },
  { key: "linkedin", label: "linkedin.com/in/ilya-moskovkin", href: "https://www.linkedin.com/in/" },
];
