import type { CaseDoc } from "@/lib/content";
import { CONTACT } from "@/lib/data";

export const SITE = {
  url: "https://ilyamoskovkin.com",
  name: "Ilya Moskovkin Portfolio",
  author: "Ilya Moskovkin",
  title: "Ilya Moskovkin — Senior Frontend Engineer",
  description:
    "Senior frontend/product engineer building React, Next.js, Vue, Nuxt, TypeScript, AI workflow, dashboard, and visual-editor interfaces.",
  shortDescription:
    "Senior frontend engineer with UI/UX roots, building product-heavy React, Next.js, Vue, Nuxt, and AI workflow interfaces.",
  locale: "en_US",
  keywords: [
    "Ilya Moskovkin",
    "Senior Frontend Engineer",
    "Frontend Product Engineer",
    "React",
    "Next.js",
    "Vue",
    "Nuxt",
    "TypeScript",
    "AI workflows",
    "Dashboard UI",
    "Visual editors",
    "Design engineering",
  ],
} as const;

export const socialLinks = CONTACT.filter((item) =>
  ["github", "linkedin"].includes(item.key),
).map((item) => item.href);

export function absoluteUrl(path = "/") {
  return new URL(path, SITE.url).toString();
}

export function getProjectImageUrl(cover?: string) {
  if (!cover) return absoluteUrl("/opengraph-image");
  if (cover.startsWith("http://") || cover.startsWith("https://")) return cover;
  return absoluteUrl(cover);
}

export function getHomeJsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person"),
    name: SITE.author,
    url: SITE.url,
    jobTitle: "Senior Frontend Engineer",
    description: SITE.shortDescription,
    sameAs: socialLinks,
    knowsAbout: SITE.keywords.filter((keyword) => keyword !== SITE.author),
  };

  return [
    person,
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      author: { "@id": absoluteUrl("/#person") },
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": absoluteUrl("/#profile"),
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
      mainEntity: { "@id": absoluteUrl("/#person") },
      isPartOf: { "@id": absoluteUrl("/#website") },
    },
  ];
}

export function getCaseJsonLd(caseStudy: CaseDoc) {
  const url = absoluteUrl(`/work/${caseStudy.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: `${caseStudy.title} — Case Study`,
    description: caseStudy.blurb,
    image: [getProjectImageUrl(caseStudy.cover)],
    url,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      "@id": absoluteUrl("/#person"),
      name: SITE.author,
      url: SITE.url,
      sameAs: socialLinks,
    },
    publisher: {
      "@type": "Person",
      "@id": absoluteUrl("/#person"),
      name: SITE.author,
    },
    keywords: caseStudy.tags,
    about: caseStudy.tags.map((tag) => ({ "@type": "Thing", name: tag })),
    isPartOf: { "@id": absoluteUrl("/#website") },
    inLanguage: "en",
  };
}

export function getCaseBreadcrumbJsonLd(caseStudy: CaseDoc) {
  const caseUrl = absoluteUrl(`/work/${caseStudy.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${caseUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Work",
        item: absoluteUrl("/#work"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: caseStudy.title,
        item: caseUrl,
      },
    ],
  };
}
