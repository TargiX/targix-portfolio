# Targix Portfolio

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

The dev script uses port `3010`, so open `http://localhost:3010`.

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
