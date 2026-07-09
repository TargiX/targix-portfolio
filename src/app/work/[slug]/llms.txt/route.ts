import { getAllSlugs, getCase, type CaseDoc } from "@/lib/content";
import { SITE, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

type Params = Promise<{ slug: string }>;

function toPublicUrl(href: string) {
  return href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
    ? href
    : absoluteUrl(href);
}

function linkLines(caseStudy: CaseDoc) {
  if (!caseStudy.links.length) return "- none listed";

  return caseStudy.links
    .map((link) => `- ${link.label}: ${toPublicUrl(link.href)}`)
    .join("\n");
}

function caseStudyBody(caseStudy: CaseDoc) {
  return `# ${caseStudy.title} · Case Study

${caseStudy.blurb}

## Metadata
- Role: ${caseStudy.role}
- Year: ${caseStudy.year}
- Canonical URL: ${absoluteUrl(`/work/${caseStudy.slug}`)}
- Tags: ${caseStudy.tags.join(", ")}

## Project links
${linkLines(caseStudy)}

## Portfolio context
${SITE.shortDescription}

## Full case study text
${caseStudy.content.trim()}
`;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const caseStudy = await getCase(slug);

  if (!caseStudy) {
    return new Response("Case study not found", { status: 404 });
  }

  return new Response(caseStudyBody(caseStudy), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
