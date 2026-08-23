"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Walkthroughs of the live Broker Online Exchange / MyServiceCloud platform,
 * pulled from the public resources hub. Each tile is a lightweight facade —
 * the YouTube iframe only mounts on click, so the grid stays fast.
 */
const VIDEOS: { id: string; title: string }[] = [
  { id: "2YcdN3ZXpLI", title: "Creating a customer" },
  { id: "s_NMn2A7qX8", title: "Quote from an account" },
  { id: "lFEJ9qzPZr8", title: "Creating a proposal" },
  { id: "FUtf_WNOHbk", title: "Creating a contract" },
];

function VideoTile({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

  return (
    <figure className="overflow-hidden rounded-md border border-line-soft bg-bg-2">
      <div className="relative aspect-video w-full">
        {active ? (
          <iframe
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group/yt absolute inset-0 size-full cursor-pointer"
            aria-label={`Play: ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              className="size-full object-cover opacity-85 transition-opacity group-hover/yt:opacity-100"
            />
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.5))]" />
            <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--accent)_50%,white)] bg-bg/70 backdrop-blur-sm transition-[border-color,transform] group-hover/yt:scale-110 group-hover/yt:border-[var(--accent)]">
              <Play className="size-5 translate-x-0.5 text-[var(--accent)]" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between border-t border-line-soft px-3 py-2 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
        <span className="truncate">{title}</span>
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 pl-2 hover:text-[var(--accent)]"
        >
          ↗
        </a>
      </figcaption>
    </figure>
  );
}

export function BrokerVideos() {
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {VIDEOS.map((v) => (
          <VideoTile key={v.id} {...v} />
        ))}
      </div>
      <p className="mt-3 border-l border-line-soft pl-3 font-mono text-[11px] leading-relaxed text-fg-dim">
        A focused sample of the live workflow: customer setup, quoting, proposals, and contract
        generation. The frontend in these flows is what my team and I built and maintained.{" "}
        <a
          href="https://www.brokeronlinexchange.com/broker-resources/"
          target="_blank"
          rel="noreferrer"
          className="text-fg hover:text-[var(--accent)]"
        >
          full resource hub ↗
        </a>
      </p>
    </div>
  );
}
