import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Proxy middleware to generate CSP nonces and set security headers.
 * This replaces 'unsafe-inline' with nonce-based CSP for better security.
 *
 * Note: This requires dynamic rendering, which means:
 * - Static optimization is disabled
 * - Pages cannot be cached by CDNs without additional configuration
 * - Partial Prerendering (PPR) is incompatible
 */
export function proxy(request: NextRequest) {
  // Generate a unique nonce for this request
  const nonce = crypto.randomBytes(16).toString("base64");

  // Clone the request headers and add the nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Determine if we're in development
  const isDevelopment = process.env.NODE_ENV === "development";

  // Build CSP directives with nonce
  // In development, Next.js requires 'unsafe-eval' for hot reloading
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${
      isDevelopment ? " 'unsafe-eval'" : ""
    }`,
    `style-src 'self' 'nonce-${nonce}'`, // Use nonce instead of unsafe-inline
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Create response with security headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set security headers
  response.headers.set("Content-Security-Policy", cspDirectives);
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
