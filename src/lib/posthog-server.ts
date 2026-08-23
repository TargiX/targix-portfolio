import "server-only";

import { createHash } from "node:crypto";

import { headers } from "next/headers";
import { PostHog } from "posthog-node";

type CaptureServerEventInput = {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
};

const POSTHOG_KEY = process.env.POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const POSTHOG_HOST = process.env.POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST;

function getPostHogClient() {
  if (!POSTHOG_KEY || !POSTHOG_HOST) return null;

  return new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

export function anonymizedDistinctId(prefix: string, value: string) {
  const digest = createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 24);
  return `${prefix}_${digest}`;
}

export async function getRequestDistinctId(fallback: string) {
  const requestHeaders = await headers();
  return requestHeaders.get("x-posthog-distinct-id") ?? fallback;
}

export async function captureServerEvent({
  event,
  distinctId,
  properties,
}: CaptureServerEventInput) {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.capture({
      distinctId,
      event,
      properties,
    });
    await client.shutdown();
  } catch (error) {
    console.error("[posthog] capture failed:", error);
  }
}
