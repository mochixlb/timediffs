import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  // Match app's color scheme: foreground is hsl(240 5.3% 26.1%) ≈ #3f3f46
  // muted-foreground is hsl(240 3.8% 46.1%) ≈ #6b6b6b
  const foreground = "#3f3f46";
  const mutedForeground = "#6b6b6b";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo SVG rendered inline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "48px",
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top timeline */}
            <line
              x1="2"
              y1="8"
              x2="22"
              y2="8"
              stroke={foreground}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Top timeline marker */}
            <circle cx="7" cy="8" r="2.25" fill={foreground} />
            {/* Bottom timeline */}
            <line
              x1="2"
              y1="16"
              x2="22"
              y2="16"
              stroke={foreground}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Bottom timeline marker */}
            <circle cx="17" cy="16" r="2.25" fill={foreground} />
            {/* Connecting line */}
            <line
              x1="7"
              y1="8"
              x2="17"
              y2="16"
              stroke={foreground}
              strokeWidth="1"
              strokeDasharray="2 1.5"
              opacity="0.2"
            />
          </svg>
        </div>

        {/* App name - matching the app's branding */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "500",
            marginBottom: "20px",
            color: foreground,
            letterSpacing: "-0.02em",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          timediffs.app
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            color: mutedForeground,
            textAlign: "center",
            maxWidth: "600px",
            fontWeight: "400",
            lineHeight: "1.5",
          }}
        >
          A simple tool for comparing timezones
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
