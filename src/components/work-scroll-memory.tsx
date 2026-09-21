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

const SCROLL_KEYS: Record<string, true> = {
  ArrowUp: true,
  ArrowDown: true,
  PageUp: true,
  PageDown: true,
  Home: true,
  End: true,
  " ": true,
};
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
    // Consume the flag whatever we decide below — a skipped restore must not
    // fire on some later, unrelated visit to "/".
    clearPendingRestore();
    if (!position) return;
    // An explicit anchor ("/#work" back links) beats saved position: let
    // Next.js scroll to the hash instead of racing it with restores.
    if (window.location.hash) return;
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
    let cleanupTimeout = 0;
    let targetY = position.y;
    let done = false;

    const restore = () => {
      const maxY = Math.max(0, root.scrollHeight - window.innerHeight);
      targetY = Math.min(Math.max(0, position.y), maxY);
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    };

    // Stop retrying restores. Called on the final cleanup tick AND the moment
    // the user takes over scrolling — otherwise a queued restore fires after
    // their first wheel/touch and yanks the page back up to the saved spot.
    const finish = () => {
      if (done) return;
      done = true;
      for (const frame of frames) window.cancelAnimationFrame(frame);
      for (const timeout of timeouts) window.clearTimeout(timeout);
      window.clearTimeout(cleanupTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchmove", finish);
      window.removeEventListener("keydown", onKeyDown);
      root.style.scrollBehavior = previousRootBehavior;
      body.style.scrollBehavior = previousBodyBehavior;
      window.history.scrollRestoration = previousHistoryRestoration;
    };

    // A scroll position we didn't set means the user (or a scrollbar drag)
    // moved the page — our restores must not fight that.
    const onScroll = () => {
      if (Math.abs(window.scrollY - targetY) > 2) finish();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS[event.key]) finish();
    };

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

    cleanupTimeout = window.setTimeout(() => {
      restore();
      finish();
    }, 1300);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("touchmove", finish, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return finish;
  }, []);

  return null;
}
