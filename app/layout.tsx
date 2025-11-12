import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { TimezoneProviderWrapper } from "@/components/timezone-provider-wrapper";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { siteConfig, createMetadata, getWebApplicationStructuredData } from "@/lib/seo";

const baseMetadata = createMetadata({
  title: "Timediffs - Timezone Comparison Tool",
  description: siteConfig.description,
  path: "/",
  structuredData: getWebApplicationStructuredData(),
});

export const metadata: Metadata = {
  ...baseMetadata,
  metadataBase: new URL(siteConfig.url),
  keywords: [
    "timezone",
    "timezone comparison",
    "world clock",
    "time converter",
    "timezone converter",
    "compare timezones",
    "time zone",
    "UTC",
    "GMT",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  other: {
    "theme-color": "#ffffff",
    ...(baseMetadata.other || {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <NuqsAdapter>
          <Suspense fallback={<LoadingSpinner />}>
            <TimezoneProviderWrapper>{children}</TimezoneProviderWrapper>
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
