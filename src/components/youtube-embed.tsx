"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type Props = {
  /** YouTube video id, e.g. "_PRKfDjIIu0" */
  id: string;
  /** Start time in seconds */
  start?: number;
  /** Accessible title / caption */
  title?: string;
  /** Custom poster image. Overrides YouTube's thumbnail (useful when the
   *  uploaded thumbnail is a title card rather than the actual UI). */
  poster?: string;
};

/**
 * Lightweight YouTube facade. Renders the thumbnail + a play button and only
 * mounts the (heavy, tracker-laden) iframe after the user clicks. Keeps the
 * page fast and avoids loading YouTube's ~1MB player on initial paint.
 */
export function YouTubeEmbed({ id, start = 0, title = "Video", poster }: Props) {
  const [active, setActive] = useState(false);

  const thumb = poster ?? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${
    start ? `&start=${start}` : ""
  }`;

  return (
    <figure className="my-7 overflow-hidden rounded-md border border-line-soft bg-bg-2">
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
              className="size-full object-cover opacity-90 transition-opacity group-hover/yt:opacity-100"
            />
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.45))]" />
            <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--accent)_50%,white)] bg-bg/70 backdrop-blur-sm transition-[border-color,transform] group-hover/yt:scale-110 group-hover/yt:border-[var(--accent)]">
              <Play className="size-6 translate-x-0.5 text-[var(--accent)]" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between border-t border-line-soft px-3 py-2 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
        <span>{title}</span>
        <a
          href={`https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ""}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--accent)]"
        >
          watch on youtube ↗
        </a>
      </figcaption>
    </figure>
  );
}

export default YouTubeEmbed;
