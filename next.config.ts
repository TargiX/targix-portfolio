import type { NextConfig } from "next";

const CANONICAL_ORIGIN = "https://ilyamoskovkin.com";
const VERCEL_APP_HOST = ".+\\.vercel\\.app";
const IS_VERCEL_PRODUCTION = process.env.VERCEL_ENV === "production";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    qualities: [75, 95],
  },
  async redirects() {
    if (!IS_VERCEL_PRODUCTION) return [];

    return [{
      source: "/:path*",
      has: [{ type: "host", value: VERCEL_APP_HOST }],
      destination: `${CANONICAL_ORIGIN}/:path*`,
      permanent: true,
    }];
  },
  // Reverse-proxy PostHog through our own origin so analytics survive ad-blockers.
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // PostHog's API routes are sensitive to trailing-slash redirects.
  skipTrailingSlashRedirect: true,
  // Baseline security headers on every response. No Content-Security-Policy
  // here yet: Next.js inline/bootstrap scripts need a nonce-based CSP, which
  // is its own verified change.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
