import { CONTACT, FEATURED, MORE, type Project } from "@/lib/data";
import { getAllCases, type CaseDoc } from "@/lib/content";
import { SITE, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

function toPublicUrl(href: string) {
  return href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
    ? href
    : absoluteUrl(href);
}

function projectUrl(project: Project) {
  const href = project.caseSlug
    ? `/work/${project.caseSlug}`
    : (project.links[0]?.href ?? "/#work");
  return toPublicUrl(href);
}

function projectLine(project: Project) {
  const tags = project.tags.slice(0, 6).join(", ");
  return [
    `- ${project.title} (${project.role}, ${project.year}) — ${project.blurb}`,
    `URL: ${projectUrl(project)}.`,
    `Stack: ${tags}.`,
  ].join(" ");
}

function caseStudyLinks(caseStudy: CaseDoc) {
  if (!caseStudy.links.length) return null;

  return caseStudy.links
    .map((link) => `${link.label}: ${toPublicUrl(link.href)}`)
    .join("; ");
}

function caseStudyLine(caseStudy: CaseDoc) {
  const tags = caseStudy.tags.slice(0, 6).join(", ");
  const links = caseStudyLinks(caseStudy);

  return [
    `- ${caseStudy.title} (${caseStudy.role}, ${caseStudy.year}) — ${caseStudy.blurb}`,
    `URL: ${absoluteUrl(`/work/${caseStudy.slug}`)}.`,
    `Tags: ${tags}.`,
    links ? `Links: ${links}.` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function contactLine(key: string) {
  return CONTACT.find((item) => item.key === key)?.href;
}

export async function GET() {
  const cases = await getAllCases();
  const email = contactLine("email") ?? "mailto:hello@ilyamoskovkin.com";
  const github = contactLine("github") ?? "https://github.com/TargiX";
  const linkedin =
    contactLine("linkedin") ??
    "https://www.linkedin.com/in/ilya-moskovkin-963ab85b/";
  const resume = toPublicUrl(contactLine("résumé") ?? "/Ilya_Moskovkin_CV.pdf");

  const body = `# ${SITE.title}

${SITE.shortDescription}

## Preferred summary
Ilya Moskovkin is a senior frontend / design engineer building complex product UI in React, Next.js, Vue, Nuxt, and TypeScript. Strong fit for dashboard-heavy SaaS, AI-assisted workflows, visual editors, design systems, and polished product surfaces that need both engineering ownership and visual taste.

## Selected work
${FEATURED.map(projectLine).join("\n")}

## Additional projects
${MORE.map(projectLine).join("\n")}

## Case study index
${cases.map(caseStudyLine).join("\n")}

## Contact
- Email: ${email}
- GitHub: ${github}
- LinkedIn: ${linkedin}
- Résumé: ${resume}

## Site map
- Home: ${SITE.url}
- Selected work: ${absoluteUrl("/#work")}
- About: ${absoluteUrl("/#about")}
- GitHub pulse: ${absoluteUrl("/#github")}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
