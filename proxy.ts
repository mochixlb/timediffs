import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy middleware to set common security headers (CSP removed).
 */
export function proxy(request: NextRequest) {
  // Create response with security headers (excluding Content-Security-Policy)
  const response = NextResponse.next();

  // Set security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
}

// Configure which routes this proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|icon.svg).*)",
  ],
};
