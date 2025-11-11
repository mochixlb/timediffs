import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { TimezoneProvider } from "@/contexts/timezone-context";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Timediffs - Timezone Comparison Tool",
  description: "Compare multiple timezones side-by-side with a clean, peaceful design",
  alternates: {
    canonical: "/",
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
          <Suspense fallback={<div>Loading...</div>}>
            <TimezoneProvider>{children}</TimezoneProvider>
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
