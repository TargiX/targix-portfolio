import type { NextConfig } from "next";

const CANONICAL_ORIGIN = "https://ilyamoskovkin.com";
const VERCEL_APP_HOST = ".+\\.vercel\\.app";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: VERCEL_APP_HOST }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
    ];
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
};

export default nextConfig;
