import { useEffect, useState } from "react";

/**
 * Detects if the current device is iOS (including iPadOS with desktop UA).
 * Uses userAgent and touch-capable Mac heuristic for iPadOS 13+.
 */
export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
      return;
    }
    const ua = navigator.userAgent || "";
    const platform = (navigator as any).platform || "";
    const isiOSUA = /iPad|iPhone|iPod/.test(ua);
    const isTouchMac =
      /Mac/.test(platform) && "ontouchend" in window && !(window as any).MSStream;
    setIsIOS(isiOSUA || isTouchMac);
  }, []);

  return isIOS;
}


