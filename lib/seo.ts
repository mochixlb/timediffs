/**
 * SEO configuration and utilities
 */

// Get site URL from environment variable with fallback
// During build, we allow the fallback. In production runtime, the env var should be set.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const siteConfig = {
  name: "timediffs.app",
  url: SITE_URL || "https://timediffs.vercel.app",
  description:
    "Compare multiple timezones side-by-side with a clean, peaceful design",
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
