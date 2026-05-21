"use client";

import { useVietnamTime } from "@/lib/use-vietnam-time";

export function StatusBar() {
  const time = useVietnamTime();
  return (
    <div className="flex items-center gap-2.5 pt-3 pb-16 text-[11px] lowercase tracking-[0.04em] text-fg-muted">
      <span className="status-dot" />
      <span>available for work</span>
      <span className="text-fg-dim">·</span>
      <span>vietnam, ict {time}</span>
    </div>
  );
}
