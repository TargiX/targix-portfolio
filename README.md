# Targix Portfolio

Personal portfolio and case-study site for Ilya Moskovkin. Built with Next.js App Router, MDX case studies, a Turso/Drizzle guestbook, and a Resend-backed contact form.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- MDX content in `content/work`
- Drizzle ORM with libSQL/Turso
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

The app can run locally without external services. Guestbook writes use `file:./local.db` by default, and the contact form logs the message when `RESEND_API_KEY` is not set.

Optional variables:

```bash
DATABASE_URL=file:./local.db
DATABASE_AUTH_TOKEN=
RESEND_API_KEY=
CONTACT_TO=targix8@gmail.com
CONTACT_FROM="Portfolio <onboarding@resend.dev>"
```

For production, use a remote libSQL/Turso `DATABASE_URL`. A production `file:` URL is treated as non-live so serverless deployments do not try to write to a read-only filesystem.

## Scripts

```bash
pnpm run dev        # start Next.js on port 3010
pnpm run build      # production build and type check
pnpm run start      # serve the production build on port 3010
pnpm run db:generate
pnpm run db:migrate
pnpm run db:push
pnpm run db:studio
```

## Content

Case studies live in `content/work/*.mdx`. Each file uses frontmatter consumed by `src/lib/content.ts` and is routed at `/work/<slug>`.
