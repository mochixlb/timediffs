/**
 * SEO configuration and utilities
 */

/**
 * Validates and normalizes the site URL from environment variable.
 * Ensures the URL is properly formatted, uses HTTPS in production, and has no trailing slash.
 *
 * @param url - The URL string to validate
 * @param isProduction - Whether we're in production environment
 * @returns The validated and normalized URL, or null if invalid
 */
function validateSiteUrl(
  url: string | undefined,
  isProduction: boolean
): string | null {
  if (!url) {
    return null;
  }

  // Remove trailing slash if present
  const normalizedUrl = url.trim().replace(/\/$/, "");

  // Basic URL format validation
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return null;
  }

  // Validate protocol - must be https in production
  if (isProduction && parsedUrl.protocol !== "https:") {
    return null;
  }

  // Validate protocol - must be http or https
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return null;
  }

  // Ensure we have a valid hostname
  if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
    return null;
  }

  return normalizedUrl;
}

// Get site URL from environment variable with validation
const isProduction = process.env.NODE_ENV === "production";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const validatedSiteUrl = validateSiteUrl(rawSiteUrl, isProduction);

// Fallback URL - used when NEXT_PUBLIC_SITE_URL is not set or invalid
// This allows builds to succeed even if the environment variable isn't configured
const FALLBACK_URL = "https://timediffs.vercel.app";

export const siteConfig = {
  name: "timediffs.app",
  url: validatedSiteUrl || FALLBACK_URL,
  description: "A simple tool for comparing timezones",
} as const;

/**
 * Generate absolute URL from a relative path
 */
export function getAbsoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Generate WebApplication structured data
 */
export function getWebApplicationStructuredData() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Compare multiple timezones side-by-side",
      "24-hour timeline visualization",
      "Add or remove timezones",
      "Drag to reorder timezones",
      "Set home timezone",
      "View any date",
      "Week view toggle",
      "Share via URL",
      "Real-time updates for today's date",
      "Responsive design",
    ],
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    softwareVersion: "1.0",
  });
}

/**
 * Generate WebPage structured data
 */
export function getWebPageStructuredData({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: getAbsoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  });
}

/**
 * Generate page metadata with defaults
 */
export function createMetadata({
  title,
  description,
  path = "/",
  ogImage,
  type = "website",
  structuredData,
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  type?: "website" | "article";
  structuredData?: string;
}) {
  const url = getAbsoluteUrl(path);
  // Next.js automatically handles opengraph-image.tsx, so we reference it
  const imageUrl = ogImage
    ? getAbsoluteUrl(ogImage)
    : getAbsoluteUrl("/opengraph-image");

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    ...(structuredData && {
      other: {
        "application/ld+json": structuredData,
      },
    }),
  };
}
