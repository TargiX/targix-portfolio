import { Suspense } from "react";

import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { LazyFooterJellyfish } from "@/components/lazy-footer-jellyfish";
import { GitHubActivity } from "@/components/server/github-activity";
import { GitHubContributions } from "@/components/server/github-contributions";
import { SiteNav } from "@/components/site-nav";
import { Reveal } from "@/components/reveal";
import { WorkStage } from "@/components/work-stage";
import { WorkScrollController } from "@/components/work-scroll-controller";
import { MoreWorkRibbon } from "@/components/more-work-ribbon";
import { CONTACT, FEATURED, MORE, STACK } from "@/lib/data";
import { getHomeJsonLd } from "@/lib/seo";

// One shared outer container width across the whole page — no more "wide here,
// narrow there" jumps between sections. Text-heavy inner blocks narrow their
// own measure for readability, but the outer rail and gutters stay consistent.
const PAGE = "mx-auto w-full max-w-[1280px] px-5 sm:px-8";

export default function Home() {
  const EMAIL = CONTACT.find((c) => c.key === "email") ?? CONTACT[0];
  const homeJsonLd = getHomeJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div id="top" />
      <SiteNav />

      <Hero />

      {/* ── FEATURED WORK ── native scroll through full-screen project stages.
          The header sits in the shared container; stages are full-bleed so
          each project owns its own inner container and visual background. */}
      <div className={PAGE}>
        <div id="work" className="flex items-baseline gap-3 pt-8 scroll-mt-20">
          <span className="font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">01</span>
          <span className="font-sans text-[20px] font-medium tracking-[-0.01em] text-fg">
            Selected Work
          </span>
          <span className="font-mono text-[11px] lowercase tracking-[0.08em] text-fg-muted">
            {FEATURED.length} projects
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" aria-hidden />
        </div>
      </div>

      <WorkScrollController>
        {FEATURED.map((p, i) => (
          <WorkStage key={p.title} project={p} index={i} />
        ))}
      </WorkScrollController>

      {/* ── MORE WORK ── horizontal ribbon of lighter builds */}
      <section className={`${PAGE} border-t border-line-soft py-16`}>
        <MoreWorkRibbon projects={MORE} />
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <main className={`${PAGE} pb-24 pt-16`}>
        <Section id="about" n="02" title="About">
          <div className="grid gap-8 sm:grid-cols-[minmax(0,820px)_auto] sm:items-start">
            <section className="[&>p]:mb-4 [&>p]:text-fg-muted [&>p:last-child]:mb-0">
              <p>
                Designer-turned-frontend engineer focused on complex product UI: dashboards,
                workflows, editors, and AI-assisted interfaces. I&rsquo;m comfortable owning the
                frontend end-to-end — from product shape and design-system decisions to
                implementation details, state management, API boundaries, and release quality.
              </p>

              <p>
                Senior frontend engineer, 10+ years building production web apps. I spent the last
                5+ years leading the frontend of a B2B SaaS platform: dashboards, complex forms,
                data grids, the kind of app real businesses run their day on. I came into
                engineering from a UI design background, so I read Figma the way a designer does.
              </p>

              <p>
                I work in both React (Next.js) and Vue (Vue 2/3, Nuxt) at production level. I&rsquo;m
                also fullstack when a project needs it — I build and run my own product,{" "}
                <a href="https://phosphene.cc">phosphene.cc</a>, end to end, including the backend,
                database and deployment. So I can take a project from design all the way to shipped.
              </p>

              <p>A few things I bring:</p>

              <ul className="my-5 flex flex-col gap-3">
                {[
                  {
                    label: "Complex SaaS interfaces:",
                    body: "dashboards, multi-step wizards, dynamic forms, data grids, filtering",
                  },
                  {
                    label: "Strong performance work:",
                    body: "virtualized lists, load-time optimization, smooth UI under heavy data",
                  },
                  {
                    label: "AI-augmented workflow:",
                    body: "Claude Code + Codex are part of my daily process: faster scaffolding, refactors, and test generation, more ground covered per hour. Architecture and quality calls stay mine.",
                  },
                  {
                    label: "AI integration in production:",
                    body: "shipped AI-powered features including a document-scanning feature and an AI image generation product",
                  },
                  {
                    label: "Testing:",
                    body: "Cypress, Playwright, Vitest.",
                  },
                  {
                    label: "Clear remote communication:",
                    body: "concrete demos, clean PRs, early flagging of risk. Remote async has been my default for 10+ years",
                  },
                ].map((item) => (
                  <li key={item.label} className="flex gap-3 text-fg-muted">
                    <span
                      aria-hidden
                      className="mt-[0.55em] size-1.5 shrink-0 rotate-45 rounded-[1px] bg-[color-mix(in_oklab,var(--accent)_75%,transparent)]"
                    />
                    <span>
                      <strong className="font-medium text-fg">{item.label}</strong> {item.body}
                    </span>
                  </li>
                ))}
              </ul>

              <p>
                Available now, open to senior frontend or design-engineering roles, contract or
                full-time. I work remote from Vietnam (UTC+7), with comfortable overlap into
                European and US-morning hours. Let&rsquo;s talk.
              </p>
            </section>

            <figure className="relative w-[240px] justify-self-end overflow-hidden rounded-full border border-line-soft bg-bg-2/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/about/ilya.jpg"
                alt="Ilya Moskovkin"
                width={240}
                height={240}
                loading="lazy"
                className="block size-[240px] select-none object-cover grayscale [transition:filter_.4s_ease] hover:grayscale-0"
              />
            </figure>
          </div>
        </Section>

        <Section id="stack" n="03" title="Stack">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STACK.map((col) => (
              <div key={col.label}>
                <div className="mb-3 text-[10px] lowercase tracking-[0.12em] text-fg-dim">
                  {col.label}
                </div>
                <ul className="flex flex-col gap-1">
                  {col.items.map((item) => (
                    <li key={item} className="text-[13px] text-fg">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-4">
            <Suspense fallback={<GitHubFallback />}>
              <GitHubContributions username="TargiX" />
            </Suspense>
            <Suspense fallback={<GitHubFallback />}>
              <GitHubActivity username="TargiX" />
            </Suspense>
          </div>
        </Section>

      </main>

      <footer className="relative mt-10 overflow-hidden">
        {/* grey-green aurora tint that rises from the bottom, mirroring the hero */}
        <div aria-hidden="true" className="footer-glow pointer-events-none absolute inset-0 z-0" />
        <LazyFooterJellyfish />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 py-14 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-[1fr_auto] sm:items-start">
            {/* big CTA */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.1em] text-fg-dim">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-[var(--accent)]" />
                </span>
                available for work
              </div>
              <a
                href={EMAIL.href}
                className="group block break-words font-sans text-[clamp(22px,7vw,44px)] font-medium tracking-[-0.02em] text-fg transition-colors hover:text-[var(--accent)]"
              >
                {EMAIL.label}
                <span className="ml-2 inline-block text-[0.6em] align-middle transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                  ↗
                </span>
              </a>
              <p className="mt-3 max-w-[46ch] text-[13px] leading-relaxed text-fg-muted">
                Open to senior frontend or design-engineering roles. Based in Vietnam, comfortable
                async.
              </p>
            </div>

            {/* links */}
            <nav className="flex flex-col gap-2.5 text-[12px] sm:text-right">
              {CONTACT.map((c) => (
                <a
                  key={c.key}
                  href={c.href}
                  target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={c.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  className="group inline-flex items-center gap-2 text-fg-muted transition-colors hover:text-[var(--accent)] sm:justify-end"
                >
                  <span className="font-mono text-[10px] lowercase tracking-[0.08em] text-fg-dim">
                    {c.key}
                  </span>
                  <span className="text-fg group-hover:text-[var(--accent)]">
                    {c.label}
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* credits */}
          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line-soft/60 pt-6 text-[10px] lowercase tracking-[0.06em] text-fg-dim">
            <span>im / portfolio / v1.0</span>
            <span className="size-[3px] rounded-full bg-fg-dim" />
            <span>built with next 16 · react 19 · tailwind v4 · three.js · framer</span>
            <span className="size-[3px] rounded-full bg-fg-dim" />
            <span className="ml-auto">© {new Date().getFullYear()} ilya moskovkin</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function GitHubFallback() {
  return (
    <div className="animate-pulse rounded-md border border-line-soft bg-bg-2/40 p-4">
      <div className="mb-3 h-3 w-40 rounded bg-bg-2" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-bg-2" />
        <div className="h-3 w-5/6 rounded bg-bg-2" />
        <div className="h-3 w-3/4 rounded bg-bg-2" />
      </div>
    </div>
  );
}
