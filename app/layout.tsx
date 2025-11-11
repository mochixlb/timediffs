import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TimezoneProvider } from "@/contexts/timezone-context";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Timediffs - Timezone Comparison Tool",
  description: "Compare multiple timezones side-by-side with a clean, peaceful design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TimezoneProvider>{children}</TimezoneProvider>
      </body>
    </html>
  );
}
