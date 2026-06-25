import type { ReactNode } from "react";

/**
 * Plain structural rail for featured work. The old hybrid scroll interception
 * felt too opinionated, so stages now rely entirely on native page scroll.
 */
export function WorkScrollController({ children }: { children: ReactNode }) {
  return (
    <div className="work-scroll-rail relative isolate flex flex-col gap-10 overflow-visible pb-10 pt-6 sm:gap-14 sm:pb-14 sm:pt-8 lg:gap-16 lg:pb-16 xl:gap-20">
      {children}
    </div>
  );
}
