# Targix Portfolio

**Live site:** [ilyamoskovkin.com](https://ilyamoskovkin.com)  
**Source:** [github.com/TargiX/targix-portfolio](https://github.com/TargiX/targix-portfolio)

Personal portfolio and case-study site for Ilya Moskovkin. Built with Next.js App Router, MDX case studies, interactive product artifacts, and a Resend-backed contact form.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- MDX content in `content/work`
- Resend for contact-form delivery

## Local Setup

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm run dev
```

By default the dev server starts at `http://localhost:3010`. If that port is busy, `scripts/start-next.mjs` automatically falls forward to the next open port and logs the fallback before Next.js prints the final local URL.

## Environment

The app can run locally without external services. The contact form only sends when `RESEND_API_KEY` is set; otherwise the UI points visitors to the direct email link.

Optional variables:

```bash
RESEND_API_KEY=
CONTACT_TO=targix8@gmail.com
CONTACT_FROM="Portfolio <onboarding@resend.dev>"
```

## Scripts

```bash
pnpm run dev        # start Next.js on port 3010
pnpm run typecheck  # run TypeScript without emitting files
pnpm run check      # typecheck, then production build
pnpm run build      # production build and type check
pnpm run start      # serve the production build on port 3010
```

## Content

Case studies live in `content/work/*.mdx`. Each file uses frontmatter consumed by `src/lib/content.ts` and is routed at `/work/<slug>`.
