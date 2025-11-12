import { useEffect, useState, useRef } from "react";

/**
 * Hook to sync an element's horizontal position with a scrollable container's scroll position.
 * Optimized for smooth, jank-free scrolling using direct DOM updates and RAF batching.
 *
 * @param scrollContainerRef - Ref to the scrollable container element
 * @param enabled - Whether the sync is enabled (e.g., only on mobile)
 * @returns The horizontal scroll offset in pixels
 */
export function useScrollSync(
  scrollContainerRef: React.RefObject<HTMLElement | null> | undefined,
  enabled: boolean = true
): number {
  const [scrollLeft, setScrollLeft] = useState(0);
  const rafId = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    if (!enabled || !scrollContainerRef || !scrollContainerRef.current) {
      setScrollLeft(0);
      return;
    }

    const container = scrollContainerRef.current;

    const updateScrollLeft = () => {
      setScrollLeft(container.scrollLeft);
      ticking.current = false;
    };

    const handleScroll = () => {
      // Throttle updates using requestAnimationFrame for smooth performance
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(updateScrollLeft);
      }
    };

    // Use passive listener for better scroll performance
    container.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial sync - read directly without RAF for immediate update
    setScrollLeft(container.scrollLeft);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      ticking.current = false;
    };
  }, [enabled, scrollContainerRef]);

  return scrollLeft;
}

/**
 * Hook that makes a target element appear horizontally sticky by counter-translating
 * it as its scroll container scrolls. Uses direct DOM mutations (no React re-renders)
 * for perfectly smooth scrolling on low-end mobile devices.
 *
 * Usage:
 *   const stickyRef = useHorizontalSticky(scrollContainerRef, enabled);
 *   return <div ref={stickyRef}> ... </div>
 */
export function useHorizontalSticky<T extends HTMLElement>(
  scrollContainerRef: React.RefObject<HTMLElement | null> | undefined,
  enabled: boolean = true
) {
  const targetRef = useRef<T | null>(null);
  const rafId = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const target = targetRef.current;
    const container = scrollContainerRef?.current;

    if (!enabled || !target || !container) {
      // Reset any transform when disabled
      if (target) {
        target.style.transform = "";
        target.style.willChange = "";
        target.style.backfaceVisibility = "";
      }
      return;
    }

    const applyTransform = () => {
      // Counter the container's horizontal scroll
      target.style.transform = `translate3d(${container.scrollLeft}px, 0, 0)`;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(applyTransform);
      }
    };

    // Prepare for GPU-accelerated, jank-free updates
    target.style.willChange = "transform";
    target.style.backfaceVisibility = "hidden";
    // Initial position
    applyTransform();

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      ticking.current = false;
    };
  }, [enabled, scrollContainerRef]);

  return targetRef;
}

