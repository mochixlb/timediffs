"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Copy link button component that copies the current URL to clipboard.
 * Shows visual feedback when the URL is successfully copied.
 * Uses Web Share API on supported devices (mobile) as a bonus feature,
 * but primarily focuses on copying the link.
 */
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = window.location.href;

    // Try Web Share API first on mobile devices (bonus feature)
    if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: "Timezone Comparison",
          text: "Check out this timezone comparison",
          url: url,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to clipboard
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    }

    // Primary action: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopyLink}
      className="h-11 min-w-[90px] lg:h-9 lg:min-w-[110px] lg:w-auto gap-1.5 lg:gap-2 border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 px-2.5 lg:px-4"
      aria-label={copied ? "Link copied to clipboard" : "Copy link to share this view"}
      title={copied ? "Link copied!" : "Copy link to share this view"}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">Copied!</span>
          <span className="lg:hidden text-xs">Copied</span>
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">Copy link</span>
          <span className="lg:hidden text-xs">Share</span>
        </>
      )}
    </Button>
  );
}

