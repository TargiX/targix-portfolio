import "server-only";

import { headers } from "next/headers";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  namespace: string;
};

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

const globalForRateLimit = globalThis as typeof globalThis & {
  __portfolioRateLimitBuckets?: Map<string, Bucket>;
};

const buckets =
  globalForRateLimit.__portfolioRateLimitBuckets ??
  (globalForRateLimit.__portfolioRateLimitBuckets = new Map<string, Bucket>());

function pruneExpired(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export async function checkRateLimit({
  limit,
  windowMs,
  namespace,
}: RateLimitOptions): Promise<RateLimitResult> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-real-ip") ??
    forwardedFor ??
    "unknown";
  const userAgent = headerList.get("user-agent")?.slice(0, 120) ?? "unknown";
  const key = `${namespace}:${ip}:${userAgent}`;
  const now = Date.now();

  pruneExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true };
}
