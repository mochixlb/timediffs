import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const backgroundColor = "#000000";
  const textColor = "#ffffff";
  const mutedTextColor = "#a3a3a3";

  return new ImageResponse(
    (
      <div
        style={{
          background: backgroundColor,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 120px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo and App Name - Horizontal Layout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "56px",
          }}
        >
          {/* Logo Icon */}
          <svg
            width="80"
            height="80"
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
              stroke={textColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Top timeline marker */}
            <circle cx="7" cy="8" r="2.25" fill={textColor} />
            {/* Bottom timeline */}
            <line
              x1="2"
              y1="16"
              x2="22"
              y2="16"
              stroke={textColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Bottom timeline marker */}
            <circle cx="17" cy="16" r="2.25" fill={textColor} />
            {/* Connecting line */}
            <line
              x1="7"
              y1="8"
              x2="17"
              y2="16"
              stroke={textColor}
              strokeWidth="1"
              strokeDasharray="2 1.5"
              opacity="0.3"
            />
          </svg>

          {/* App name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "600",
              color: textColor,
              letterSpacing: "-0.025em",
              fontFamily: "system-ui, -apple-system, sans-serif",
              lineHeight: "1",
            }}
          >
            timediffs.app
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "32px",
            color: mutedTextColor,
            textAlign: "center",
            fontWeight: "400",
            lineHeight: "1.4",
            letterSpacing: "-0.01em",
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
