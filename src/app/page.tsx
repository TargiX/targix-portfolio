import { Suspense } from "react";
import { LayoutDashboard, PackageCheck, UserCheck } from "lucide-react";

import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { LazyFooterJellyfish } from "@/components/lazy-footer-jellyfish";
import { GitHubActivity } from "@/components/server/github-activity";
import { GitHubContributions } from "@/components/server/github-contributions";
import { SiteNav } from "@/components/site-nav";
import { Reveal } from "@/components/reveal";
import { WorkStage } from "@/components/work-stage";
import { WorkScrollController } from "@/components/work-scroll-controller";
import { WorkScrollMemory } from "@/components/work-scroll-memory";
import { MoreWorkRibbon } from "@/components/more-work-ribbon";
import { SectionTracker } from "@/components/section-tracker";
import { CONTACT, FEATURED, MORE } from "@/lib/data";
import { getHomeJsonLd } from "@/lib/seo";

// One shared outer container width across the whole page — no more "wide here,
// narrow there" jumps between sections. Text-heavy inner blocks narrow their
// own measure for readability, but the outer rail and gutters stay consistent.
const PAGE = "mx-auto w-full max-w-[1280px] px-5 sm:px-8";

export default function Home() {
  const EMAIL = CONTACT.find((c) => c.key === "email") ?? CONTACT[0];
  const homeJsonLd = getHomeJsonLd([...FEATURED, ...MORE]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div id="top" />
      <WorkScrollMemory />
      <SiteNav />
      <SectionTracker />

      <Hero />

      {/* ── FEATURED WORK ── native scroll through full-screen project stages.
          The header sits in the shared container; stages are full-bleed so
          each project owns its own inner container and visual background. */}
      <div className="work-continuum relative overflow-hidden">
        <div className={`${PAGE} relative z-10`}>
          <div id="work" className="flex items-baseline gap-3 pt-8 scroll-mt-20">
            <span className="font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">02</span>
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
      </div>

      {/* ── MORE WORK ── horizontal ribbon of lighter builds */}
      <section className={`${PAGE} border-t border-line-soft py-16`}>
        <MoreWorkRibbon projects={MORE} />
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <main className={`${PAGE} pb-24 pt-16`}>
        <Section id="about" n="03" title="About">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,720px)_minmax(360px,420px)] lg:items-start lg:gap-x-10 xl:grid-cols-[minmax(0,760px)_minmax(380px,430px)]">
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
                      className="mt-[0.72em] h-px w-5 shrink-0 bg-[color-mix(in_oklab,var(--accent)_72%,transparent)]"
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

            <aside className="lg:sticky lg:top-24 lg:-mt-2">
              <figure className="group/portrait relative mx-auto aspect-[4/5] w-full max-w-[390px] justify-self-center">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-bg-2/30 shadow-[0_28px_80px_rgba(0,0,0,.28)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/about/ilya-2026.jpg"
                    alt="Ilya Moskovkin"
                    width={1540}
                    height={1924}
                    loading="lazy"
                    className="block size-full select-none object-cover object-[50%_38%]"
                  />
                </div>
                {/* green corner-brackets (crop-marks) — real rounded corner where the two sides meet, 1px */}
                <span aria-hidden className="pointer-events-none absolute -left-3 -top-3 z-30 size-5 rounded-tl-[4px] border-l border-t border-[var(--accent)]" />
                <span aria-hidden className="pointer-events-none absolute -right-3 -top-3 z-30 size-5 rounded-tr-[4px] border-r border-t border-[var(--accent)]" />
                <span aria-hidden className="pointer-events-none absolute -right-3 -bottom-3 z-30 size-5 rounded-br-[4px] border-r border-b border-[var(--accent)]" />
                <span aria-hidden className="pointer-events-none absolute -left-3 -bottom-3 z-30 size-5 rounded-bl-[4px] border-l border-b border-[var(--accent)]" />
              </figure>
              <figcaption className="mx-auto mt-3 max-w-[390px] text-right font-mono text-[10px] lowercase tracking-[0.1em] text-fg-dim">
                ilya moskovkin · frontend & design-eng
              </figcaption>
            </aside>
          </div>
        </Section>

        <Section id="stack" n="03" title="Product Workflow">
          <div className="grid gap-x-4 gap-y-6 lg:grid-cols-9 lg:items-start">
            <div className="min-w-0 lg:col-span-3">
              <p className="max-w-[52ch] text-[15px] leading-relaxed text-fg-muted">
                I build AI-powered SaaS features where the model has to work inside a real business
                workflow: structured inputs, review states, failure handling, permissions, and
                production UI around the generation.
              </p>
              <p className="mt-4 max-w-[52ch] text-[13px] leading-relaxed text-fg-muted">
                The useful part is not adding a chatbot. It is turning messy work into an interface
                people can trust, correct, approve, and ship through.
              </p>
            </div>

            {[
              {
                label: "AI SaaS features",
                items: [
                  "document scanning",
                  "structured extraction",
                  "dynamic forms",
                  "AI-assisted review",
                  "workflow builders",
                ],
              },
              {
                label: "Integration layer",
                items: [
                  "LLM orchestration",
                  "RAG and retrieval",
                  "structured outputs",
                  "async generation UX",
                  "cost and failure states",
                ],
              },
              {
                label: "Product delivery",
                items: [
                  "Figma to production",
                  "frontend plus API glue",
                  "validation and edge cases",
                  "loading and error states",
                  "clean handoff quality",
                ],
              },
            ].map((col) => (
              <div
                key={col.label}
                className="min-w-0 rounded-md border border-line-soft bg-bg-2/35 p-4 lg:col-span-2"
              >
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
                  {col.label}
                </div>
                <ul className="flex flex-col gap-2">
                  {col.items.map((item) => (
                    <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-fg-muted">
                      <span
                        aria-hidden
                        className="mt-[0.58em] size-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {[
              {
                value: "business UI",
                body: "dashboards, admin panels, CRMs, data grids, filters, and multi-step flows",
                icon: LayoutDashboard,
              },
              {
                value: "human in the loop",
                body: "review screens where users approve, correct, retry, or explain AI output",
                icon: UserCheck,
              },
              {
                value: "full feature slices",
                body: "frontend, backend glue, database shape, deployment, and quality checks",
                icon: PackageCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.value} className="min-w-0 border-t border-line-soft pt-4 lg:col-span-3">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-md border border-line-soft bg-bg-2/45 text-[var(--accent)]">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <div className="font-sans text-[18px] font-medium tracking-[-0.01em] text-fg">
                      {item.value}
                    </div>
                  </div>
                  <p className="max-w-[44ch] text-[12px] leading-relaxed text-fg-muted">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="github" n="04" title="GitHub Pulse" kicker="public signal">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start">
            <div className="min-w-0">
              <Suspense fallback={<GitHubFallback />}>
                <GitHubContributions username="TargiX" />
              </Suspense>
            </div>
            <div className="min-w-0">
              <Suspense fallback={<GitHubFallback />}>
                <GitHubActivity username="TargiX" />
              </Suspense>
            </div>
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
