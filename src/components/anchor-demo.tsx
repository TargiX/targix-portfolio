"use client";

import { useState } from "react";

/**
 * Live, interactive embed of the Anchor app inside a phone frame.
 *
 * TODO: swap ANCHOR_URL for the real Vercel deployment once it's live.
 * The iframe renders the app at the frame's CSS width (~300px), so the app
 * sees a true mobile viewport — no scaling hacks needed.
 */
const ANCHOR_URL = "https://anchor-ritual.vercel.app"; // placeholder — replace with live URL
const ANCHOR_LANDING = `${ANCHOR_URL}/`;

export function AnchorDemo() {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className="my-8 flex flex-col items-center gap-4">
      <div className="relative">
        {/* Phone frame */}
        <div className="relative rounded-[2.4rem] border border-line bg-[oklch(0.16_0.006_250)] p-2.5 shadow-2xl shadow-black/40">
          {/* notch */}
          <div className="absolute left-1/2 top-2.5 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-[oklch(0.16_0.006_250)]" />

          <div className="relative h-[600px] w-[300px] overflow-hidden rounded-[1.9rem] bg-bg-2">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.08em] text-fg-dim">
                loading anchor…
              </div>
            )}
            <iframe
              src={ANCHOR_LANDING}
              title="Anchor — live app"
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      </div>

      {/* caption / chrome */}
      <figcaption className="flex items-center gap-3 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-1.5 rounded-full bg-[var(--accent)]" />
          live · interactive
        </span>
        <span className="size-1 rounded-full bg-fg-dim" />
        <a
          href={ANCHOR_URL}
          target="_blank"
          rel="noreferrer"
          className="group border-b border-line pb-0.5 text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          open fullscreen
          <span className="ml-1 inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            ↗
          </span>
        </a>
      </figcaption>
    </figure>
  );
}
