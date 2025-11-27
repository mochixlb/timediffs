"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the current screen size is mobile (< 1024px).
 * Uses the same breakpoint as Tailwind's `lg` breakpoint.
 * SSR-safe: returns false on server-side to avoid hydration mismatches.
 */
export function useIsMobile() {
  // Initialize with actual value on client to avoid flash of incorrect content
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check on mount
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
