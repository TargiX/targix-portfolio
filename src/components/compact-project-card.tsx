import Link from "next/link";
import type { Project } from "@/lib/data";

/**
 * Small project card for the "more work" tier — a 4-column grid of lighter,
 * lower-priority projects below the big highlighted cards. It's a shrunken
 * version of <ProjectCard>: same media stage (gradient + dot grid, thumb or
 * monogram fallback), same lime→teal title hover. The whole card is a link.
 */
export function CompactProjectCard({ project }: { project: Project }) {
  const { year, title, blurb, tags, links, caseSlug, thumb } = project;
  const external = links?.[0]?.href;
  const href = caseSlug ? `/work/${caseSlug}` : external;
  const isExternal = href ? /^https?:\/\//.test(href) : false;

  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-line-soft bg-bg-2/30 transition-colors duration-300 hover:border-[color:color-mix(in_oklab,var(--accent)_30%,var(--line))]">
      {/* Media stage — same treatment as the big card, scaled down */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-2">
        <div
          aria-hidden
          className="absolute inset-0 [background:radial-gradient(120%_110%_at_50%_-10%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%),linear-gradient(180deg,oklch(0.2_0.006_250),oklch(0.16_0.006_250))]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,color-mix(in_oklab,var(--accent)_22%,transparent)_1px,transparent_1.5px)] [background-size:16px_16px]"
        />

        {thumb ? (
          <img
            src={thumb}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-sans text-[40px] font-medium tracking-[-0.03em] text-white/12">
              {title.charAt(0)}
            </span>
          </div>
        )}

        <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-white/70 backdrop-blur">
          {year}
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="card-title m-0 font-sans text-[15px] font-medium tracking-[-0.01em]">
          {title}
        </h3>

        {blurb && (
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.5] text-fg-muted">{blurb}</p>
        )}

        {tags?.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((t) => (
              <li
                key={t}
                className="whitespace-nowrap rounded-full border border-line px-1.5 py-0.5 text-[10px] text-fg-muted"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        <span
          aria-hidden
          className="mt-3 inline-block font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim transition-colors group-hover/card:text-[color:var(--accent)]"
        >
          {caseSlug ? `${title} case study →` : isExternal ? "open ↗" : "sample build"}
        </span>
      </div>

      {href &&
        (isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${title} — open`}
            className="absolute inset-0 z-10 rounded-xl"
          />
        ) : (
          <Link
            href={href}
            prefetch
            aria-label={`${title} — open case study`}
            className="absolute inset-0 z-10 rounded-xl"
          />
        ))}
    </article>
  );
}
