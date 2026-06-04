import { Suspense } from "react";

import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { ProjectCard } from "@/components/project-card";
import { CompactProjectCard } from "@/components/compact-project-card";
import { FooterJellyfish } from "@/components/footer-jellyfish";
import { DitheredPhoto } from "@/components/dithered-photo";
import { TimelineEditor } from "@/components/lab/timeline-editor";
import { GitHubActivity } from "@/components/server/github-activity";
import { GitHubContributions } from "@/components/server/github-contributions";
import { ContactForm } from "@/components/forms/contact-form";
import { ViewSwitcher } from "@/components/view-switcher";
import { PromptCompilerArtifact } from "@/components/prompt-compiler-artifact";
import { AiChat } from "@/components/lab/ai-chat";
import { CONTACT, FEATURED, MINOR, SECONDARY, STACK } from "@/lib/data";
import { getHomeJsonLd } from "@/lib/seo";
import { InteractiveSkills } from "@/components/interactive-skills";

// Narrow measure for text-heavy sections (readability ~70ch).
const CONTAINER = "relative mx-auto max-w-[880px] px-5 pb-24 pt-6 sm:px-8";
// Wider stage for the visual work showcase — lets cards breathe on big screens.
const WORK_CONTAINER = "relative mx-auto max-w-[1280px] px-5 pb-24 pt-6 sm:px-8";

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

        <Section id="work" n="01" title="Selected Work" kicker={`${1 + SECONDARY.length} projects`}>
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
      <Section id="lab" n="01" title="Lab" kicker="canvas · timelines · drag & drop" accent>
        {/* intro text stays a readable measure; the editor spans the full stage */}
        <p className="mb-6 max-w-[60ch] text-fg-muted">
          The rest of this site is restrained on purpose. This part isn&apos;t — it&apos;s the
          other half of what I do. A working mini video-timeline: real drag-and-drop, trimmable
          clips, a scrubbing playhead, and a live preview of what&apos;s on screen. No library
          doing the heavy lifting — just pointer math, state, and{" "}
          <code className="rounded bg-bg-2 px-1 py-0.5 text-[0.85em] text-fg">requestAnimationFrame</code>.
        </p>
        <TimelineEditor />
        <p className="mt-4 max-w-[60ch] text-[11px] lowercase tracking-[0.06em] text-fg-dim">
          this is the kind of surface I like building — editors, timelines, creative tools.
          more demos landing here over time.
        </p>
      </Section>

      <Section
        id="artifact"
        n="02"
        title="Mini Artifact"
        kicker="graph state · prompt compiler · run plan"
        accent
      >
        <div>
          <p className="mb-6 text-fg-muted">
            A small interactive compiler surface that shows the actual product idea. Toggle nodes,
            watch the prompt rebuild, and see how the generation run would be routed.
          </p>
          <PromptCompilerArtifact />
        </div>
      </Section>

      <Section
        id="ai"
        n="03"
        title="AI Chat"
        kicker="streaming · provider-agnostic · openrouter"
        accent
      >
        <p className="mb-6 max-w-[60ch] text-fg-muted">
          A provider-agnostic chat surface. Today it streams tokens from a free model via a server
          proxy (the API key never touches the browser); the interface is built around a swappable
          provider, so an in-browser <code className="rounded bg-bg-2 px-1 py-0.5 text-[0.85em] text-fg">WebLLM</code> backend
          drops in next behind the same toggle.
        </p>
        <AiChat />
      </Section>
    </main>
  );

  // ── ABOUT ──────────────────────────────────────────────
  const about = (
    <main className={CONTAINER}>
      <Section id="about" n="01" title="About">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="[&>p]:mb-4 [&>p]:text-fg-muted [&>p:last-child]:mb-0">
            <p>
              ~12 years building for the web, the last several as a frontend engineer and
              lead. I came up through UI/UX design, and that&apos;s the crossover I sell — not
              a separate track: I can sit with a PM, sketch the interaction, then build it
              through to the database without a handoff.
            </p>
            <p>
              Lately I&apos;m happiest in the messy middle of{" "}
              <span className="text-fg">products that don&apos;t exist yet</span> — picking the
              stack, drawing the first screens, shipping the v0 to real users, and rewriting
              whichever parts were wrong. Phosphene is the current version of that itch.
            </p>
            <p className="text-fg-dim">
              Based in Vietnam. Comfortable async. Open to senior frontend,
              frontend-heavy product engineering, or design-engineering roles.
            </p>
          </div>

          <DitheredPhoto
            src="/about/ilya.jpg"
            alt="ilya at the rig · saigon"
            width={260}
            height={340}
            pixelSize={2}
            className="justify-self-end"
          />
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
        <p className="mb-6 text-fg-muted">
          The form goes through a Server Action and lands in my inbox via Resend. The mailto and
          direct links below work too — pick whichever feels less formal.
        </p>

        {!isContactConfigured && (
          <div className="mb-3 flex items-center gap-2 rounded-sm border border-dashed border-line bg-bg-2/30 px-3 py-1.5 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
            <span className="inline-block size-1.5 rounded-full bg-amber-400/70" />
            contact form not configured here — use the direct email link below
          </div>
        )}

        <ContactForm disabled={!isContactConfigured} />

        <ul className="mt-10 flex flex-col gap-2.5">
          {CONTACT.map((c) => (
            <li
              key={c.key}
              className="grid grid-cols-[80px_1fr] items-center gap-4 border-b border-line-soft pb-2.5 sm:grid-cols-[100px_1fr]"
            >
              <span className="text-[11px] lowercase tracking-[0.06em] text-fg-dim">{c.key}</span>
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

      <footer className="relative mt-10 overflow-hidden border-t border-line-soft">
        <FooterJellyfish />
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
                Open to senior frontend, frontend-heavy product engineering, or
                design-engineering roles. Based in Vietnam, comfortable async.
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
                  <span className="text-fg group-hover:text-[var(--accent)]">{c.label}</span>
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
