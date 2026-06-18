"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type PostHogClient = typeof import("posthog-js").default;

let posthogClient: Promise<PostHogClient> | null = null;
let initialized = false;

function loadPostHog() {
  posthogClient ??= import("posthog-js").then((module) => module.default);
  return posthogClient;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || !pathname) return;

    let active = true;

    loadPostHog().then((posthog) => {
      if (!active) return;
      if (!initialized) {
        posthog.init(key, {
          api_host: "/ingest",
          ui_host: "https://us.posthog.com",
          capture_pageview: false,
          capture_pageleave: true,
          person_profiles: "always",
        });
        initialized = true;
      }

      let url = window.origin + pathname;
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
      posthog.capture("$pageview", { $current_url: url });
    });

    return () => {
      active = false;
    };
  }, [pathname, searchParams]);

  return null;
}
