"use client";

import { SECTION_SEQUENCE, useActiveSection } from "@/lib/use-active-section";

export function SectionTracker() {
  const active = useActiveSection();
  const current = SECTION_SEQUENCE.find((section) => section.id === active) ?? SECTION_SEQUENCE[0];

  return (
    <aside className="section-tracker" aria-label="Current page section">
      <div className="section-tracker-current" key={current.id}>
        <span className="section-tracker-mark" aria-hidden="true" />
        <span className="section-tracker-number">{current.n}</span>
        <span className="section-tracker-label">{current.label}</span>
      </div>
    </aside>
  );
}
