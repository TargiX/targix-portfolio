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
