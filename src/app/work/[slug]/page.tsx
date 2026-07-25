import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

import { getAllSlugs, getCase, getAdjacentCases } from "@/lib/content";
import { mdxComponents } from "@/components/mdx-components";
import { BackToWork } from "@/components/back-to-work";
import { LightboxProvider } from "@/components/lightbox";
import { CaseMetaRail } from "@/components/case-meta-rail";
import { CaseNav } from "@/components/case-nav";
import { CaseRouteReset } from "@/components/case-route-reset";
import { ContactForm } from "@/components/forms/contact-form";
import { CONTACT } from "@/lib/data";
import {
  SITE,
  absoluteUrl,
  getCaseBreadcrumbJsonLd,
  getCaseJsonLd,
  getProjectImageUrl,
} from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCase(slug);
  if (!c) return {};
  const title = c.title;
  const ogTitle = `${c.title} · Ilya Moskovkin`;
  const url = absoluteUrl(`/work/${c.slug}`);
  const ogImage = getProjectImageUrl(c.cover);

  return {
    title,
    description: c.blurb,
    alternates: {
      canonical: `/work/${c.slug}`,
    },
    keywords: [...c.tags, SITE.author, "case study", "frontend engineering"],
    openGraph: {
      title: ogTitle,
      description: c.blurb,
      url,
      siteName: SITE.name,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: c.blurb,
      images: [ogImage],
    },
  };
}

export default async function CasePage({ params }: { params: Params }) {
  const { slug } = await params;
  const c = await getCase(slug);
  if (!c) notFound();
  const caseJsonLd = getCaseJsonLd(c);
  const breadcrumbJsonLd = getCaseBreadcrumbJsonLd(c);
  const { prev, next } = await getAdjacentCases(slug);

  return (
    <main key={c.slug} className="relative mx-auto max-w-[1080px] px-5 pb-24 pt-12 sm:px-8">
      <CaseRouteReset />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([caseJsonLd, breadcrumbJsonLd]).replace(/</g, "\\u003c"),
        }}
      />
      <BackToWork key={c.slug} />

      {/* Cover is a full-width band above the article grid — the wide "hero". */}
      {c.cover && (
        <figure className="mb-12 mt-10">
          <div className="overflow-hidden rounded-md border border-line-soft bg-bg-2/60">
            <div className="relative aspect-[1200/630] bg-bg">
              <img
                src={c.cover}
                alt={`${c.title} product preview`}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </figure>
      )}

      {/* One grid runs through the whole article: a left reading column
          (title, lede, body — same left edge top to bottom) and a sticky
          meta rail on the right. On mobile it stacks head → rail → body. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13.75rem] lg:items-start lg:gap-x-16">
        <header className="lg:col-start-1 lg:row-start-1">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-muted">
            <span className="text-fg-dim">{c.role}</span>
            <span className="size-1 rounded-full bg-[var(--accent)]" />
            <span>{c.year}</span>
          </div>

          <h1 className="heading-gradient m-0 mb-6 w-fit font-sans text-[52px] font-medium leading-[1.05] tracking-[-0.025em] sm:text-[64px]">
            {c.title}
          </h1>

          <p className="m-0 max-w-[56ch] font-mono text-[17px] leading-[1.6] text-fg-muted">
            {c.blurb}
          </p>
        </header>

        <CaseMetaRail role={c.role} year={c.year} links={c.links} tags={c.tags} />

        <div className="lg:col-start-1 lg:row-start-2">
          <div className="mt-10 mb-10 h-px bg-line-soft" />
          <LightboxProvider>
            <article>
              <MDXRemote
                source={c.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      [
                        rehypePrettyCode,
                        {
                          theme: { dark: "github-dark-dimmed", light: "github-dark-dimmed" },
                          keepBackground: false,
                        },
                      ],
                    ],
                  },
                }}
              />
            </article>
          </LightboxProvider>
        </div>
      </div>

      <CaseContactCTA caseTitle={c.title} />

      <CaseNav prev={prev} next={next} />

      <footer className="mt-20 flex items-center justify-between border-t border-line-soft pt-8 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim">
        <Link
          href="/#work"
          className="group inline-flex items-center gap-2 transition-colors hover:text-fg"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
          back to work
        </Link>
        <span>im / portfolio / case</span>
      </footer>
    </main>
  );
}

type ContactKey = (typeof CONTACT)[number]["key"];

function contactHref(key: ContactKey) {
  const href = CONTACT.find((item) => item.key === key)?.href;
  if (!href) {
    throw new Error(`Missing CONTACT entry for key: ${key}`);
  }
  return href;
}

function CaseContactCTA({ caseTitle }: { caseTitle: string }) {
  const emailHref = `${contactHref("email")}?subject=${encodeURIComponent(
    `Project inquiry after reading ${caseTitle}`,
  )}`;
  const resumeHref = contactHref("résumé");
  const linkedinHref = contactHref("linkedin");

  return (
    <section className="mt-16 overflow-hidden rounded-md border border-line-soft bg-bg-2/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[58ch]">
          <p className="mb-3 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">
            available for senior frontend / product engineering
          </p>
          <h2 className="m-0 font-sans text-[30px] font-medium leading-[1.08] tracking-[-0.02em] text-fg sm:text-[38px]">
            Need this level of product UI in your team?
          </h2>
          <p className="mt-4 max-w-[52ch] font-mono text-[14px] leading-[1.6] text-fg-muted">
            I build dense, polished interfaces across React/Next.js and Vue/Nuxt — from ambiguous product brief
            to shipped, reviewable production code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs lowercase tracking-[0.04em]">
          <a
            href={emailHref}
            className="btn-gradient-border inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium text-fg transition-colors hover:text-[var(--accent)]"
          >
            email me <span aria-hidden="true">↗</span>
          </a>
          <a
            href={resumeHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            résumé <span aria-hidden="true">↗</span>
          </a>
          <a
            href={linkedinHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            linkedin <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="mt-8 border-t border-line-soft pt-6">
        <div className="mb-5 max-w-[58ch]">
          <p className="mb-2 font-mono text-[11px] lowercase tracking-[0.08em] text-fg-dim">
            start a scoped conversation
          </p>
          <p className="m-0 text-[14px] leading-relaxed text-fg-muted">
            Your message will include this case study, so the conversation starts with the relevant
            product context.
          </p>
        </div>
        <ContactForm caseTitle={caseTitle} />
      </div>
    </section>
  );
}
