import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import matter from "gray-matter";

export type CaseLink = { label: string; href: string };

export type CaseMeta = {
  slug: string;
  title: string;
  year: string;
  role: string;
  blurb: string;
  tags: string[];
  links: CaseLink[];
  cover?: string;
  order?: number;
  featured?: boolean;
};

export type CaseDoc = CaseMeta & { content: string };

const CONTENT_DIR = path.join(process.cwd(), "content/work");

/** Read and parse all case study MDX files. Memoized per render. */
export const getAllCases = cache(async (): Promise<CaseDoc[]> => {
  let entries: string[];
  try {
    entries = await readdir(CONTENT_DIR);
  } catch {
    return [];
  }

  const cases = await Promise.all(
    entries
      .filter((f) => f.endsWith(".mdx"))
      .map(async (filename) => {
        const fullPath = path.join(CONTENT_DIR, filename);
        const raw = await readFile(fullPath, "utf8");
        const { data, content } = matter(raw);
        const slug = (data.slug as string | undefined) ?? filename.replace(/\.mdx$/, "");
        return { ...(data as Omit<CaseMeta, "slug">), slug, content } satisfies CaseDoc;
      }),
  );

  return cases.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
});

export async function getCase(slug: string): Promise<CaseDoc | null> {
  const all = await getAllCases();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getAllSlugs(): Promise<string[]> {
  const all = await getAllCases();
  return all.map((c) => c.slug);
}
