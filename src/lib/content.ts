import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import matter from "gray-matter";
import { z } from "zod";

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

const CaseFrontmatterSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1),
  year: z.coerce.string().min(1),
  role: z.string().min(1),
  blurb: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  links: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })).default([]),
  cover: z.string().min(1).optional(),
  order: z.number().optional(),
  featured: z.boolean().default(false),
});

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
        const parsed = CaseFrontmatterSchema.safeParse(data);
        if (!parsed.success) {
          throw new Error(
            `Invalid case study frontmatter in ${filename}: ${z.prettifyError(parsed.error)}`,
          );
        }
        const slug = parsed.data.slug ?? filename.replace(/\.mdx$/, "");
        return { ...parsed.data, slug, content } satisfies CaseDoc;
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

/** Return the previous and next case study for a given slug (sorted by order). */
export async function getAdjacentCases(
  slug: string,
): Promise<{ prev: CaseMeta | null; next: CaseMeta | null }> {
  const all = await getAllCases();
  const idx = all.findIndex((c) => c.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  // "prev" = earlier in the list (lower order), "next" = later
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  return { prev, next };
}
