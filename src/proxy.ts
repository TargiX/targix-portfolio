import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight proxy (Next 16's renamed middleware) that runs on every page request.
 *
 * Today it does two small things:
 *   1. Adds `x-pathname` so server components can read the current path
 *      without prop-drilling (useful for active-link styling, logging).
 *   2. Adds a `Vary: Cookie` hint so any future auth-aware caching behaves.
 *
 * Excluded from API routes, static assets, and Next internals via matcher.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  response.headers.append("Vary", "Cookie");
  return response;
}

export const config = {
  matcher: [
    // Run on everything except static, images, favicon, and Next internals.
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
