import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

import { getAllSlugs, getCase } from "@/lib/content";
import { mdxComponents } from "@/components/mdx-components";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCase(slug);
  if (!c) return {};
  const title = `${c.title} — Ilya Moskovkin`;
  const ogImage = `/work/${c.slug}/opengraph-image`;

  return {
    title,
    description: c.blurb,
    openGraph: {
      title,
      description: c.blurb,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
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

  return (
    <main className="relative mx-auto max-w-[1040px] px-5 pb-24 pt-12 sm:px-8">
      <Link
        href="/#work"
        className="group inline-flex items-center gap-2 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-dim transition-colors hover:text-fg"
      >
        <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
        back to work
      </Link>

      <header className="mt-10 mb-12 border-b border-line-soft pb-10">
        {c.cover && (
          <figure className="mb-9">
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

        <div className="mb-4 flex items-center gap-3 font-mono text-[11px] lowercase tracking-[0.06em] text-fg-muted">
          <span className="text-fg-dim">{c.role}</span>
          <span className="size-1 rounded-full bg-fg-dim" />
          <span>{c.year}</span>
        </div>

        <h1 className="heading-gradient m-0 mb-6 w-fit font-sans text-[52px] font-medium leading-[1.05] tracking-[-0.025em] sm:text-[64px]">
          {c.title}
        </h1>

        <p className="m-0 mb-6 max-w-[58ch] font-mono text-base leading-[1.55] text-fg-muted">
          {c.blurb}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {c.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="group border-b border-line pb-0.5 text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {l.label}
              <span className="ml-1 inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          ))}
        </div>

        {c.tags.length > 0 && (
          <ul className="mt-7 flex flex-wrap gap-1.5">
            {c.tags.map((t) => (
              <li
                key={t}
                className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[11px] text-fg-muted"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </header>

      <article className="mx-auto max-w-[760px]">
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
