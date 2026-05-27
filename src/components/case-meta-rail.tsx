import type { ReactNode } from "react";

import type { CaseLink } from "@/lib/content";

type Props = {
  role: string;
  year: string;
  links: CaseLink[];
  tags: string[];
};

export function CaseMetaRail({ role, year, links, tags }: Props) {
  return (
    <aside className="mt-12 font-mono text-[11px] text-fg-muted lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-1 lg:self-start lg:sticky lg:top-8">
      <RailSection label="role">
        <div className="text-xs leading-[1.5] text-fg">{role}</div>
      </RailSection>

      <RailSection label="year" divided>
        <div className="text-xs leading-[1.5] text-fg">{year}</div>
      </RailSection>

      {links.length > 0 && (
        <RailSection label="links" divided>
          <div className="flex flex-col items-start gap-2">
            {links.map((link) => (
              <CaseLinkButton key={link.label} link={link} />
            ))}
          </div>
        </RailSection>
      )}

      {tags.length > 0 && (
        <RailSection label="stack" divided>
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[10.5px] text-fg-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        </RailSection>
      )}
    </aside>
  );
}

function RailSection({
  label,
  divided,
  children,
}: {
  label: string;
  divided?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={divided ? "border-t border-line-soft py-3.5" : "pb-3.5"}>
      <div className="mb-2 text-[10.5px] lowercase tracking-[0.08em] text-fg-dim">{label}</div>
      {children}
    </div>
  );
}

function CaseLinkButton({ link }: { link: CaseLink }) {
  const external = /^https?:\/\//.test(link.href);
  const primary = /live|demo|site|app/i.test(link.label);

  return (
    <a
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={
        primary
          ? // transparent text button, lifted by a thin gradient border. negative
            // left margin pulls the label flush with the underline links above it
            // so the column stays aligned despite the border padding.
            "btn-gradient-border group -ml-2.5 inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-fg transition-colors hover:text-[var(--accent)]"
          : "group inline-flex w-fit items-center gap-1 border-b border-line pb-0.5 text-xs text-fg-muted transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }
    >
      {link.label}
      <span className="inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        {external ? "↗" : "→"}
      </span>
    </a>
  );
}
