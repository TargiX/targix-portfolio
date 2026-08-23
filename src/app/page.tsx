import Link from "next/link";
import { ArrowUpRight, LayoutDashboard, PackageCheck, UserCheck } from "lucide-react";

import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { LazyFooterJellyfish } from "@/components/lazy-footer-jellyfish";
import { SiteNav } from "@/components/site-nav";
import { WorkStage } from "@/components/work-stage";
import { WorkScrollController } from "@/components/work-scroll-controller";
import { WorkScrollMemory } from "@/components/work-scroll-memory";
import { MoreWorkRibbon } from "@/components/more-work-ribbon";
import { SectionTracker } from "@/components/section-tracker";
import { CONTACT, FEATURED, MORE } from "@/lib/data";
import { getHomeJsonLd } from "@/lib/seo";

const PAGE = "mx-auto w-full max-w-[1280px] px-5 sm:px-8";

const CAPABILITIES = [
  {
    title: "Complex operator UI",
    body: "Dashboards, dense forms, data grids, review states, and workflows people run their day on.",
    icon: LayoutDashboard,
  },
  {
    title: "AI with human control",
    body: "Extraction and generation flows where users can review, correct, retry, and understand failure.",
    icon: UserCheck,
  },
  {
    title: "Full feature ownership",
    body: "Product shape, design system, frontend, API boundaries, release quality, and production follow-through.",
    icon: PackageCheck,
  },
] as const;

const PROOF_PATHS = [
  {
    href: "/proof?for=operator",
    eyebrow: "Complex SaaS",
    title: "Operator surfaces",
    body: "Production workflows, data density, permissions, and decisions under pressure.",
  },
  {
    href: "/proof?for=ai",
    eyebrow: "Applied AI",
    title: "AI that lands in a workflow",
    body: "Generation, extraction, correction states, failure handling, and product boundaries.",
  },
  {
    href: "/proof?for=ownership",
    eyebrow: "Design engineering",
    title: "From product shape to ship",
    body: "Independent products where interaction design and implementation are one responsibility.",
  },
] as const;

export default function Home() {
  const email = CONTACT.find((contact) => contact.key === "email") ?? CONTACT[0];
  const linkedin = CONTACT.find((contact) => contact.key === "linkedin");
  const resume = CONTACT.find((contact) => contact.key === "résumé");
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

      <div className="work-continuum relative overflow-hidden">
        <div className={`${PAGE} relative z-10`}>
          <div id="work" className="flex items-baseline gap-3 scroll-mt-20 pt-8">
            <span className="font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">02</span>
            <span className="font-sans text-[20px] font-medium text-fg">Selected Work</span>
            <span className="font-mono text-[11px] lowercase tracking-[0.08em] text-fg-muted">
              {FEATURED.length} kinds of proof
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" aria-hidden />
          </div>
        </div>

        <WorkScrollController>
          {FEATURED.map((project, index) => (
            <WorkStage key={project.title} project={project} index={index} />
          ))}
        </WorkScrollController>
      </div>

      <section className={`${PAGE} border-t border-line-soft py-12`}>
        <MoreWorkRibbon projects={MORE} />
      </section>

      <main className={`${PAGE} pb-16 pt-8`}>
        <Section id="about" n="03" title="About">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-16">
            <div>
              <p className="max-w-[34ch] font-sans text-[24px] font-light leading-[1.35] text-fg sm:text-[30px]">
                Designer-turned-engineer for products where the interface carries real operational
                weight.
              </p>
              <p className="mt-5 max-w-[68ch] text-[15px] leading-[1.75] text-fg-muted">
                I have spent 10+ years shipping web products and nearly five leading frontend for a
                private B2B SaaS platform. I work at production depth in Vue/Nuxt and React/Next.js,
                and I am comfortable owning the path from product and design decisions through API
                boundaries, implementation, testing, and release quality.
              </p>
              <p className="mt-4 max-w-[68ch] text-[15px] leading-[1.75] text-fg-muted">
                I now build and operate Phosphene end to end while staying available for senior
                frontend and design-engineering roles. Remote from Vietnam (UTC+7), with long-term
                async collaboration as my default.
              </p>

              <div className="mt-8 grid gap-x-8 sm:grid-cols-2">
                {CAPABILITIES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="border-t border-line-soft py-5">
                      <div className="mb-2 flex items-center gap-2.5">
                        <Icon className="size-4 text-[var(--accent)]" aria-hidden="true" />
                        <h3 className="font-sans text-[16px] font-medium text-fg">{item.title}</h3>
                      </div>
                      <p className="max-w-[46ch] text-[12px] leading-[1.65] text-fg-muted">
                        {item.body}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-[11px] lowercase tracking-[0.05em]">
                <a href={email.href} className="text-fg transition-colors hover:text-[var(--accent)]">
                  email me ↗
                </a>
                {resume && (
                  <a
                    href={resume.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fg-muted transition-colors hover:text-[var(--accent)]"
                  >
                    résumé ↗
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fg-muted transition-colors hover:text-[var(--accent)]"
                  >
                    linkedin ↗
                  </a>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-24">
              <figure className="relative mx-auto aspect-[4/5] w-full max-w-[340px]">
                <div className="relative size-full overflow-hidden rounded-sm bg-bg-2/30 shadow-[0_28px_80px_rgba(0,0,0,.28)]">
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
                <span aria-hidden className="absolute -left-3 -top-3 size-5 rounded-tl-[4px] border-l border-t border-[var(--accent)]" />
                <span aria-hidden className="absolute -right-3 -top-3 size-5 rounded-tr-[4px] border-r border-t border-[var(--accent)]" />
                <span aria-hidden className="absolute -bottom-3 -right-3 size-5 rounded-br-[4px] border-b border-r border-[var(--accent)]" />
                <span aria-hidden className="absolute -bottom-3 -left-3 size-5 rounded-bl-[4px] border-b border-l border-[var(--accent)]" />
              </figure>
              <figcaption className="mx-auto mt-3 max-w-[340px] text-right font-mono text-[10px] lowercase tracking-[0.1em] text-fg-dim">
                ilya moskovkin · frontend &amp; design engineering
              </figcaption>
            </aside>
          </div>
        </Section>

        <Section id="evidence" n="04" title="Review by capability" kicker="about 5 minutes">
          <div className="grid gap-8 lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.7fr)] lg:gap-14">
            <div>
              <p className="max-w-[24ch] font-sans text-[26px] font-light leading-[1.25] text-fg">
                Follow the proof that matches the work you need done.
              </p>
              <p className="mt-4 max-w-[42ch] text-[13px] leading-[1.7] text-fg-muted">
                Each path is a short, role-aware route through shipped case studies and concrete
                product surfaces.
              </p>
              <Link
                href="/proof"
                className="group mt-6 inline-flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.05em] text-fg transition-colors hover:text-[var(--accent)]"
              >
                open evidence builder
                <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="border-b border-line-soft">
              {PROOF_PATHS.map((path, index) => (
                <Link
                  key={path.href}
                  href={path.href}
                  className="group grid gap-2 border-t border-line-soft py-5 transition-colors sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center sm:gap-5"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
                    0{index + 1} · {path.eyebrow}
                  </span>
                  <span>
                    <strong className="block font-sans text-[17px] font-medium text-fg transition-colors group-hover:text-[var(--accent)]">
                      {path.title}
                    </strong>
                    <span className="mt-1 block max-w-[58ch] text-[12px] leading-[1.6] text-fg-muted">
                      {path.body}
                    </span>
                  </span>
                  <ArrowUpRight className="hidden size-4 text-fg-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)] sm:block" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </Section>
      </main>

      <footer className="relative mt-6 overflow-hidden">
        <div aria-hidden="true" className="footer-glow pointer-events-none absolute inset-0 z-0" />
        <LazyFooterJellyfish />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 py-14 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.1em] text-fg-dim">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-[var(--accent)]" />
                </span>
                available for work
              </div>
              <a
                href={email.href}
                className="group block break-words font-sans text-[clamp(22px,7vw,44px)] font-medium text-fg transition-colors hover:text-[var(--accent)]"
              >
                {email.label}
                <span className="ml-2 inline-block text-[0.6em] align-middle transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                  ↗
                </span>
              </a>
              <p className="mt-3 max-w-[48ch] text-[13px] leading-relaxed text-fg-muted">
                Senior frontend and design engineering. Vue or React. Complex SaaS and applied AI.
              </p>
            </div>

            <nav className="flex flex-col gap-2.5 text-[12px] sm:text-right">
              {CONTACT.map((contact) => (
                <a
                  key={contact.key}
                  href={contact.href}
                  target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={contact.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  className="group inline-flex items-center gap-2 text-fg-muted transition-colors hover:text-[var(--accent)] sm:justify-end"
                >
                  <span className="font-mono text-[10px] lowercase tracking-[0.08em] text-fg-dim">
                    {contact.key}
                  </span>
                  <span className="text-fg group-hover:text-[var(--accent)]">{contact.label}</span>
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line-soft/60 pt-6 text-[10px] lowercase tracking-[0.06em] text-fg-dim">
            <span>im / portfolio / evidence-first</span>
            <span className="size-[3px] rounded-full bg-fg-dim" />
            <span>next 16 · react 19 · tailwind v4</span>
            <span className="size-[3px] rounded-full bg-fg-dim" />
            <span className="ml-auto">© {new Date().getFullYear()} ilya moskovkin</span>
          </div>
        </div>
      </footer>
    </>
  );
}
