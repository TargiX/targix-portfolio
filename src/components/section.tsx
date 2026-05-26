import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  id,
  n,
  title,
  kicker,
  className,
  accent = false,
  children,
}: {
  id: string;
  n: string;
  title: string;
  kicker?: string;
  className?: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("border-t border-line-soft py-14", accent && "group/section", className)}
    >
      <header className="mb-9 flex items-baseline gap-3.5 text-[11px] tracking-[0.08em] text-fg-muted">
        <span className="lowercase text-fg-dim">{n}</span>
        <span
          className={cn(
            "font-sans text-[20px] font-medium tracking-[-0.01em]",
            accent ? "section-title" : "text-fg",
          )}
        >
          {title}
        </span>
        {kicker && <span className="lowercase">{kicker}</span>}
        <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" aria-hidden="true" />
      </header>
      <div className="[&>p]:mb-4 [&>p]:text-fg-muted [&>p:last-child]:mb-0">{children}</div>
    </section>
  );
}
