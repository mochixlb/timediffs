import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { TimezoneProviderWrapper } from "@/components/timezone-provider-wrapper";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const metadata: Metadata = {
  title: "Timediffs - Timezone Comparison Tool",
  description: "Compare multiple timezones side-by-side with a clean, peaceful design",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
