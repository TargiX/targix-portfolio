import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

import { getAllSlugs, getCase } from "@/lib/content";
import { mdxComponents } from "@/components/mdx-components";
import { BackToWork } from "@/components/back-to-work";

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
    <main className="relative mx-auto max-w-[1080px] px-5 pb-24 pt-12 sm:px-8">
      <BackToWork />

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

        <aside className="mt-12 font-mono text-[11px] text-fg-muted lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-1 lg:self-start lg:sticky lg:top-8">
          <div className="pb-3.5">
            <div className="mb-2 text-[10.5px] lowercase tracking-[0.08em] text-fg-dim">role</div>
            <div className="text-xs leading-[1.5] text-fg">{c.role}</div>
          </div>
          <div className="border-t border-line-soft py-3.5">
            <div className="mb-2 text-[10.5px] lowercase tracking-[0.08em] text-fg-dim">year</div>
            <div className="text-xs leading-[1.5] text-fg">{c.year}</div>
          </div>
          {c.links.length > 0 && (
            <div className="border-t border-line-soft py-3.5">
              <div className="mb-2 text-[10.5px] lowercase tracking-[0.08em] text-fg-dim">links</div>
              <div className="flex flex-col items-start gap-2">
                {c.links.map((l) => {
                  const ext = /^https?:\/\//.test(l.href);
                  const isPrimaryLink = /live|demo|site|app/i.test(l.label);
                  return (
                    <a
                      key={l.label}
                      href={l.href}
                      target={ext ? "_blank" : undefined}
                      rel={ext ? "noreferrer" : undefined}
                      className={
                        isPrimaryLink
                          ? "group inline-flex w-full items-center justify-between gap-2 rounded-md border border-[color:color-mix(in_oklab,var(--accent)_42%,var(--line))] bg-[color:color-mix(in_oklab,var(--accent)_10%,transparent)] px-3 py-2 text-xs font-medium text-fg shadow-[0_0_24px_color-mix(in_oklab,var(--accent)_10%,transparent)] transition-colors hover:border-[var(--accent)] hover:bg-[color:color-mix(in_oklab,var(--accent)_16%,transparent)] hover:text-[var(--accent)]"
                          : "group inline-flex w-fit items-center gap-1 border-b border-line pb-0.5 text-xs text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      }
                    >
                      {l.label}
                      <span className="inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        {ext ? "↗" : "→"}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          {c.tags.length > 0 && (
            <div className="border-t border-line-soft py-3.5">
              <div className="mb-2 text-[10.5px] lowercase tracking-[0.08em] text-fg-dim">stack</div>
              <ul className="flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <li
                    key={t}
                    className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[10.5px] text-fg-muted"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">
          <div className="mt-10 mb-10 h-px bg-line-soft" />
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
        </div>
      </div>

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
