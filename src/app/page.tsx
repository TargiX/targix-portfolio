import { Suspense } from "react";

import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { ProjectCard } from "@/components/project-card";
import { CompactProjectCard } from "@/components/compact-project-card";
import { LazyFooterJellyfish } from "@/components/lazy-footer-jellyfish";
import { GitHubActivity } from "@/components/server/github-activity";
import { GitHubContributions } from "@/components/server/github-contributions";
import { ContactForm } from "@/components/forms/contact-form";
import { ViewSwitcher } from "@/components/view-switcher";
import { ProductLaunchSimulator } from "@/components/lab/product-launch-simulator";
import { ExperimentGallery } from "@/components/lab/experiment-gallery";
import { CONTACT, FEATURED, MINOR, SECONDARY, STACK } from "@/lib/data";
import { getHomeJsonLd } from "@/lib/seo";
import { InteractiveSkills } from "@/components/interactive-skills";

// Narrow measure for text-heavy sections (readability ~70ch).
const CONTAINER = "relative mx-auto max-w-[880px] px-5 pb-24 pt-6 sm:px-8";
// Wider stage for the visual work showcase — lets cards breathe on big screens.
const WORK_CONTAINER =
  "relative mx-auto max-w-[1280px] px-5 pb-24 pt-6 sm:px-8";

export default function Home() {
  const isContactConfigured = Boolean(process.env.RESEND_API_KEY);
  const EMAIL = CONTACT.find((c) => c.key === "email") ?? CONTACT[0];
  const homeJsonLd = getHomeJsonLd();

  // ── WORK ───────────────────────────────────────────────
  const work = (
    <>
      <Hero />
      <main className={WORK_CONTAINER}>
        <InteractiveSkills />

        <Section
          id="work"
          n="01"
          title="Selected Work"
          kicker={`${1 + SECONDARY.length} projects`}
        >
          <div className="grid grid-cols-1 gap-5 [perspective:1200px] sm:grid-cols-2">
            {[FEATURED, ...SECONDARY].map((p, i) => (
              <ProjectCard key={p.title} project={p} order={i} />
            ))}
          </div>

          {MINOR.length > 0 && (
            <div className="mt-16">
              <div className="mb-6 flex items-center gap-4 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim">
                <span>more work</span>
                <span className="h-px flex-1 bg-line-soft" />
                <span>{MINOR.length} side projects</span>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {MINOR.map((p) => (
                  <CompactProjectCard key={p.title} project={p} />
                ))}
              </div>
            </div>
          )}
        </Section>
      </main>
    </>
  );

  // ── LAB ────────────────────────────────────────────────
  const lab = (
    <main className={WORK_CONTAINER}>
      <Section
        id="lab"
        n="01"
        title="Product Launch Simulator"
        kicker="wizard · scroll reveal · handoff"
        accent
      >
        <p className="mb-6 max-w-[66ch] text-fg-muted">
          A cinematic product-engineering demo: pick a messy product shape,
          watch the interface assemble itself, and leave with a generated build
          packet. It&apos;s built to show the work that usually hides between
          Figma, state machines, and implementation plans.
        </p>
        <ProductLaunchSimulator />
      </Section>

      <Section
        id="experiments"
        n="02"
        title="Experiment Gallery"
        kicker="editors · AI · interaction studies"
        accent
      >
        <p className="mb-6 max-w-[66ch] text-fg-muted">
          Smaller demos live behind a selector instead of stacking into a noisy
          wall. Pick one surface at a time: editor mechanics, prompt
          compilation, streaming chat, or the compact flow wizard prototype.
        </p>
        <ExperimentGallery />
      </Section>
    </main>
  );

  // ── ABOUT ──────────────────────────────────────────────
  const about = (
    <main className={CONTAINER}>
      <Section id="about" n="01" title="About">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
          <section className="[&>p]:mb-4 [&>p]:text-fg-muted [&>p:last-child]:mb-0">
            <p>
              Senior frontend engineer, 10+ years building production web apps.
              I spent the last 5+ years leading the frontend of a B2B SaaS
              platform: dashboards, complex forms, data grids, the kind of app
              real businesses run their day on.
            </p>

            <p>
              What I do best is turn design into interfaces that genuinely feel
              good to use. Pixel-perfect implementation, smooth interactions,
              fast load times, and the small details that make an interface feel
              effortless. I came into engineering from a UI design background,
              so I read Figma the way a designer does.
            </p>

            <p>
              I work in both Vue (Vue 2/3, Nuxt) and React (Next.js) at
              production level. I'm also fullstack when a project needs it, I
              build and run my own product,{" "}
              <a href="https://phosphene.cc">phosphene.cc</a>, end to end,
              including the backend, database and deployment. So I can take a
              project from design all the way to shipped.
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
                    <strong className="font-medium text-fg">{item.label}</strong>{" "}
                    {item.body}
                  </span>
                </li>
              ))}
            </ul>

            <p>
              Comfortable jumping into a messy codebase and shipping real
              improvements. Full stack listed below.
            </p>

            <p>
              Available now, open to senior frontend or design-engineering
              roles, contract or full-time. I work remote from Vietnam (UTC+7),
              with comfortable overlap into European and US-morning hours. Let's
              talk.
            </p>
          </section>

          <figure className="relative w-[260px] justify-self-end overflow-hidden rounded-md border border-line-soft bg-bg-2/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about/ilya.jpg"
              alt="Ilya Moskovkin"
              width={260}
              height={340}
              loading="lazy"
              className="block h-[340px] w-full select-none object-cover"
            />
          </figure>
        </div>
      </Section>

      <Section id="stack" n="02" title="Stack">
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

      <Section id="contact" n="03" title="Contact">
        {isContactConfigured ? (
          <>
            <p className="mb-6 text-fg-muted">
              The form goes through a Server Action and lands in my inbox via
              Resend. The mailto and direct links below work too, pick whichever
              feels less formal.
            </p>
            <ContactForm disabled={false} />
          </>
        ) : (
          <p className="mb-6 text-fg-muted">
            Fastest way to reach me is email; links below. I usually reply
            within a day.
          </p>
        )}

        <ul className="mt-10 flex flex-col gap-2.5">
          {CONTACT.map((c) => (
            <li
              key={c.key}
              className="grid grid-cols-[80px_1fr] items-center gap-4 border-b border-line-soft pb-2.5 sm:grid-cols-[100px_1fr]"
            >
              <span className="text-[11px] lowercase tracking-[0.06em] text-fg-dim">
                {c.key}
              </span>
              <a
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={c.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group text-fg transition-colors hover:text-[var(--accent)]"
              >
                {c.label}
                <span className="ml-1 inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ViewSwitcher work={work} lab={lab} about={about} />

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
                Open to senior frontend or design-engineering roles. Based in
                Vietnam, comfortable async.
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
            <span>
              built with next 16 · react 19 · tailwind v4 · three.js · framer
            </span>
            <span className="size-[3px] rounded-full bg-fg-dim" />
            <span className="ml-auto">
              © {new Date().getFullYear()} ilya moskovkin
            </span>
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
