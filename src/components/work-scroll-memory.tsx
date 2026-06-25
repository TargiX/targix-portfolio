"use client";

import { useLayoutEffect } from "react";

const POSITION_KEY = "im:work-scroll-position";
const RESTORE_KEY = "im:restore-work-scroll";
const MAX_AGE_MS = 30 * 60 * 1000;

type StoredPosition = {
  path: string;
  ts: number;
  y: number;
};

function saveWorkScrollPosition() {
  try {
    const position: StoredPosition = {
      path: window.location.pathname + window.location.search + window.location.hash,
      ts: Date.now(),
      y: window.scrollY,
    };
    window.sessionStorage.setItem(POSITION_KEY, JSON.stringify(position));
    window.sessionStorage.setItem(RESTORE_KEY, "1");
  } catch {
    // Session storage can be unavailable in hardened browser modes.
  }
}

function readWorkScrollPosition(): StoredPosition | null {
  try {
    if (window.sessionStorage.getItem(RESTORE_KEY) !== "1") return null;
    const raw = window.sessionStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredPosition>;
    if (typeof parsed.y !== "number" || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > MAX_AGE_MS) return null;
    return {
      path: typeof parsed.path === "string" ? parsed.path : "/#work",
      ts: parsed.ts,
      y: parsed.y,
    };
  } catch {
    return null;
  }
}

function clearPendingRestore() {
  try {
    window.sessionStorage.removeItem(RESTORE_KEY);
  } catch {
    // Ignore storage failures; this is only a progressive enhancement.
  }
}

function restoreScrollY(y: number) {
  const root = document.documentElement;
  const maxY = Math.max(0, root.scrollHeight - window.innerHeight);
  window.scrollTo({
    top: Math.min(Math.max(0, y), maxY),
    left: 0,
    behavior: "auto",
  });
}

export function WorkScrollMemory() {
  useLayoutEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith("/work/")) {
        return;
      }

      saveWorkScrollPosition();
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, []);

  useLayoutEffect(() => {
    if (window.location.pathname !== "/") return;

    const position = readWorkScrollPosition();
    if (!position) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;
    const previousHistoryRestoration = window.history.scrollRestoration;

    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    window.history.scrollRestoration = "manual";

    const frames: number[] = [];
    const timeouts: number[] = [];
    const restore = () => restoreScrollY(position.y);

    restore();
    frames.push(
      window.requestAnimationFrame(() => {
        restore();
        frames.push(window.requestAnimationFrame(restore));
      }),
    );

    for (const delay of [80, 180, 360, 720, 1200]) {
      timeouts.push(window.setTimeout(restore, delay));
    }

    const cleanupTimeout = window.setTimeout(() => {
      restoreScrollY(position.y);
      root.style.scrollBehavior = previousRootBehavior;
      body.style.scrollBehavior = previousBodyBehavior;
      window.history.scrollRestoration = previousHistoryRestoration;
    }, 1300);

    clearPendingRestore();

    return () => {
      for (const frame of frames) window.cancelAnimationFrame(frame);
      for (const timeout of timeouts) window.clearTimeout(timeout);
      window.clearTimeout(cleanupTimeout);
      root.style.scrollBehavior = previousRootBehavior;
      body.style.scrollBehavior = previousBodyBehavior;
      window.history.scrollRestoration = previousHistoryRestoration;
    };
  }, []);

  return null;
}
