import { Suspense } from "react";

import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { CaseCard } from "@/components/case-card";
import { DitheredPhoto } from "@/components/dithered-photo";
import { TimelineEditor } from "@/components/lab/timeline-editor";
import { Guestbook } from "@/components/server/guestbook";
import { GitHubActivity } from "@/components/server/github-activity";
import { GitHubContributions } from "@/components/server/github-contributions";
import { ContactForm } from "@/components/forms/contact-form";
import { CONTACT, FEATURED, SECONDARY, STACK } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Hero />
      <main className="relative mx-auto max-w-[880px] px-5 pb-20 pt-6 sm:px-8">

      <Section id="work" n="01" title="Selected Work" kicker={`${1 + SECONDARY.length} projects`}>
        <CaseCard project={FEATURED} />

        <div className="mt-7 text-[11px] lowercase tracking-[0.08em] text-fg-dim">
          more — {SECONDARY.length} smaller cases
        </div>
        <div className="mt-2 grid grid-cols-1 border-t border-dashed border-line-soft sm:grid-cols-2">
          {SECONDARY.map((p, i) => (
            <CaseCard
              key={p.title}
              project={p}
              compact
              className={
                i % 2 === 0
                  ? "border-t-0 pr-0 sm:border-r sm:border-dashed sm:border-line-soft sm:pr-8"
                  : "border-t-0 pl-0 sm:pl-6"
              }
            />
          ))}
        </div>
      </Section>

      <Section id="lab" n="02" title="Lab" kicker="canvas · timelines · drag & drop">
        <p className="mb-6 max-w-[60ch] text-fg-muted">
          The rest of this site is restrained on purpose. This part isn&apos;t — it&apos;s the
          other half of what I do. A working mini video-timeline: real drag-and-drop, trimmable
          clips, a scrubbing playhead, and a live preview of what&apos;s on screen. No library
          doing the heavy lifting — just pointer math, state, and{" "}
          <code className="rounded bg-bg-2 px-1 py-0.5 text-[0.85em] text-fg">requestAnimationFrame</code>.
        </p>
        <TimelineEditor />
        <p className="mt-4 text-[11px] lowercase tracking-[0.06em] text-fg-dim">
          this is the kind of surface I like building — editors, timelines, creative tools.
          more demos landing here over time.
        </p>
      </Section>

      <Section id="about" n="03" title="About">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="[&>p]:mb-4 [&>p]:text-fg-muted [&>p:last-child]:mb-0">
            <p>
              I started in UI/UX — eight-plus years of design work before I wrote production
              code. The crossover is the thing I sell: I can sit with a PM and sketch the
              interaction, then go build it through to the database without a handoff.
            </p>
            <p>
              Lately I&apos;m happiest in the messy middle of{" "}
              <span className="text-fg">products that don&apos;t exist yet</span> — picking the
              stack, drawing the first screens, shipping the v0 to real users, and rewriting
              whichever parts were wrong. Phosphene is the current version of that itch.
            </p>
            <p className="text-fg-dim">
              Based in Vietnam. Comfortable async. Open to senior IC, founding engineer, or
              design-engineering roles.
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

      <Section id="stack" n="04" title="Stack">
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

      <Section
        id="guestbook"
        n="05"
        title="Guestbook"
        kicker="server action · sqlite · useOptimistic"
      >
        <p className="mb-6 text-fg-muted">
          A small thing demonstrating end-to-end App Router: form submits to a Server Action,
          writes to libsql via Drizzle, the list updates optimistically before the network
          round-trip lands.
        </p>
        <Suspense fallback={<GuestbookFallback />}>
          <Guestbook />
        </Suspense>
      </Section>

      <Section id="contact" n="06" title="Contact">
        <p className="mb-6 text-fg-muted">
          The form goes through a Server Action and lands in my inbox via Resend. The mailto
          and direct links below work too — pick whichever feels less formal.
        </p>

        {!process.env.RESEND_API_KEY && (
          <div className="mb-3 flex items-center gap-2 rounded-sm border border-dashed border-line bg-bg-2/30 px-3 py-1.5 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
            <span className="inline-block size-1.5 rounded-full bg-amber-400/70" />
            demo mode · RESEND_API_KEY not set — submissions are logged, not sent
          </div>
        )}

        <ContactForm />

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

        <footer className="mt-16 flex flex-wrap items-center gap-3 border-t border-line-soft pt-6 text-[10px] lowercase tracking-[0.06em] text-fg-dim">
          <span>im / portfolio / v1.0</span>
          <span className="size-[3px] rounded-full bg-fg-dim" />
          <span>built with next 16 · react 19 · tailwind v4 · shadcn · pixi.js</span>
          <span className="size-[3px] rounded-full bg-fg-dim" />
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </main>
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

function GuestbookFallback() {
  return (
    <div className="grid animate-pulse gap-7 sm:grid-cols-[1fr_1.3fr]">
      <div className="h-44 rounded-md border border-line-soft bg-bg-2/40" />
      <div className="space-y-2.5">
        <div className="h-3 w-32 rounded bg-bg-2" />
        <div className="h-14 rounded-md border border-line-soft bg-bg-2/30" />
        <div className="h-14 rounded-md border border-line-soft bg-bg-2/30" />
      </div>
    </div>
  );
}
