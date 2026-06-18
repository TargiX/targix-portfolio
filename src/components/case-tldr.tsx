import { cn } from "@/lib/utils";

/**
 * TL;DR block pinned to the top of a case study. Hiring managers scan in
 * seconds — this gives role, a one-line read, the proof points, and the stack
 * before the long-form story.
 *
 * Points come in as markdown children (a bulleted list authored in the .mdx),
 * and stack as a comma-separated string — both because next-mdx-remote does not
 * reliably pass array/object props to custom components, but strings and
 * children (already-compiled MDX) always round-trip.
 */
export function CaseTLDR({
  role,
  line,
  stack,
  children,
  className,
}: {
  role: string;
  line: string;
  stack?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const tags = (stack ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <aside
      className={cn(
        "case-tldr mb-10 rounded-md border border-line-soft bg-bg-2/40 p-5 sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2.5 font-mono text-[11px] lowercase tracking-[0.12em] text-fg-dim">
        <span className="size-1.5 rounded-full bg-[var(--accent)]" />
        tl;dr
        <span className="text-fg-muted">· {role}</span>
      </div>

      <p className="m-0 mb-4 font-sans text-[17px] font-medium leading-[1.4] tracking-[-0.01em] text-fg sm:text-[19px]">
        {line}
      </p>

      {children && (
        <div
          className={cn(
            "mb-4",
            "[&>ul]:m-0 [&>ul]:flex [&>ul]:flex-col [&>ul]:gap-2 [&>ul]:list-none [&>ul]:ml-0 [&>ul]:space-y-0",
            "[&>ul>li]:list-none [&>ul>li]:ml-0 [&>ul>li]:flex [&>ul>li]:gap-2.5",
            "[&>ul>li]:text-[13px] [&>ul>li]:leading-[1.55] [&>ul>li]:text-fg-muted [&>ul>li]:before:mt-[0.6em] [&>ul>li]:before:size-1.5 [&>ul>li]:before:shrink-0 [&>ul>li]:before:rotate-45 [&>ul>li]:before:rounded-[1px] [&>ul>li]:before:bg-[color-mix(in_oklab,var(--accent)_70%,transparent)] [&>ul>li]:before:content-['']",
          )}
        >
          {children}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((s) => (
            <span
              key={s}
              className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 font-mono text-[10.5px] lowercase tracking-[0.04em] text-fg-muted"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </aside>
  );
}
