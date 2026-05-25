import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/content";

const SITE_URL = process.env.SITE_URL ?? "https://ilyamoskovkin.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/work/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
