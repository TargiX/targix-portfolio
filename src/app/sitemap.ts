import type { MetadataRoute } from "next";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { getAllSlugs } from "@/lib/content";
import { SITE, absoluteUrl } from "@/lib/seo";

const CONTENT_DIR = path.join(process.cwd(), "content/work");
const HOMEPAGE_MTIME_FILES = [
  path.join(process.cwd(), "src/app/page.tsx"),
  path.join(process.cwd(), "src/app/layout.tsx"),
  path.join(process.cwd(), "src/lib/data.ts"),
  path.join(process.cwd(), "src/components/hero.tsx"),
];

async function getNewestMtime(files: string[]) {
  const stats = await Promise.all(
    files.map((file) => stat(file).catch(() => null)),
  );
  const latest = stats.reduce((max, item) => Math.max(max, item?.mtimeMs ?? 0), 0);
  return latest ? new Date(latest) : undefined;
}

async function getCaseMtimesBySlug() {
  const entries = await readdir(CONTENT_DIR).catch(() => []);
  const pairs = await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".mdx"))
      .map(async (filename) => {
        const fullPath = path.join(CONTENT_DIR, filename);
        const raw = await readFile(fullPath, "utf8");
        const { data } = matter(raw);
        const slug = (data.slug as string | undefined) ?? filename.replace(/\.mdx$/, "");
        const fileStat = await stat(fullPath);
        return [slug, fileStat.mtime] as const;
      }),
  );
  return new Map(pairs);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const caseMtimes = await getCaseMtimesBySlug();
  const homepageLastModified = await getNewestMtime(HOMEPAGE_MTIME_FILES);

  return [
    {
      url: SITE.url,
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/llms.txt"),
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...slugs.map((slug) => ({
      url: absoluteUrl(`/work/${slug}`),
      lastModified: caseMtimes.get(slug),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
