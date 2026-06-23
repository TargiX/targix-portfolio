import type { ReactNode } from "react";

/**
 * Plain structural rail for featured work. The old hybrid scroll interception
 * felt too opinionated, so stages now rely entirely on native page scroll.
 */
export function WorkScrollController({ children }: { children: ReactNode }) {
  return (
    <div className="work-scroll-rail">
      {children}
    </div>
  );
}
