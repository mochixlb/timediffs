import { useEffect, useRef } from "react";

/**
 * Imperatively syncs a target element's horizontal transform with a scroll container's scrollLeft.
 * Avoids React re-renders during scroll for buttery-smooth performance on mobile Safari.
 */
export function useScrollFollow(
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  targetElementRef: React.RefObject<HTMLElement | null>,
  enabled: boolean = true
) {
  const rafIdRef = useRef<number | null>(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const targetEl = targetElementRef.current;

    if (!enabled || !scrollEl || !targetEl) {
      // Reset transform when disabled
      if (targetEl) {
        targetEl.style.transform = "";
        targetEl.style.willChange = "";
        (targetEl.style as any).backfaceVisibility = "";
      }
      return;
    }

    // Hint the browser for GPU acceleration and reduce painting artifacts on iOS
    targetEl.style.willChange = "transform";
    (targetEl.style as any).backfaceVisibility = "hidden";

    const applyTransform = () => {
      // Round to whole pixels to minimize subpixel jitter on iOS Safari
      const x = Math.round(scrollEl.scrollLeft);
      targetEl.style.transform = `translate3d(${x}px, 0, 0)`;
      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        rafIdRef.current = requestAnimationFrame(applyTransform);
      }
    };

    // Initial position
    applyTransform();

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      tickingRef.current = false;
    };
  }, [enabled, scrollContainerRef, targetElementRef]);
}


