import { useEffect, useRef } from "react";
import { useIsMobile } from "./use-is-mobile";

interface UseScrollToCurrentTimeParams {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  currentHourIndex: number | null;
  totalHours: number;
  enabled?: boolean;
}

/**
 * Hook that scrolls the timeline container to center the current hour on mobile.
 * Ensures the current hour is visible in the center with 3 hours before and after.
 * Only runs on mobile devices and when enabled.
 * 
 * Automatically scrolls on initial load and when the hour changes, ensuring
 * the current time is always visible by default.
 */
export function useScrollToCurrentTime({
  scrollContainerRef,
  currentHourIndex,
  totalHours,
  enabled = true,
}: UseScrollToCurrentTimeParams) {
  const isMobile = useIsMobile();
  const previousHourIndexRef = useRef<number | null>(null);
  const hasInitiallyScrolledRef = useRef(false);

  useEffect(() => {
    // Only scroll on mobile and when enabled
    if (!isMobile || !enabled || currentHourIndex === null || totalHours === 0) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    // Find the timeline flex container to measure its width
    const flexContainer = scrollContainer.querySelector(
      "[data-timeline-flex-container]"
    ) as HTMLElement;

    if (!flexContainer) {
      return;
    }

    // Check if this is initial scroll or hour change
    const isInitialScroll = !hasInitiallyScrolledRef.current;
    const hourChanged = previousHourIndexRef.current !== currentHourIndex;
    
    // Only scroll on initial load or when hour changes
    if (!isInitialScroll && !hourChanged) {
      return;
    }

    // Calculate scroll position to center the current hour
    // Each hour is 1/24 of the timeline width
    // We want to center the current hour, so scroll to: (currentHourIndex - 3) * hourWidth
    // This shows 3 hours before, current hour, and 3 hours after (7 total)
    const timelineWidth = flexContainer.offsetWidth;
    const hourWidth = timelineWidth / totalHours;
    const containerWidth = scrollContainer.clientWidth;
    
    // Calculate target scroll position to center current hour
    // Show 3 hours before current, so scroll to (currentHourIndex - 3) * hourWidth
    // But ensure we don't scroll past the start or end
    const idealScrollLeft = (currentHourIndex - 3) * hourWidth;
    const maxScrollLeft = Math.max(0, timelineWidth - containerWidth);
    const targetScrollLeft = Math.max(0, Math.min(idealScrollLeft, maxScrollLeft));

    // Use requestAnimationFrame to ensure layout is complete
    const scrollToPosition = () => {
      // Only scroll if position differs significantly (avoid jitter)
      if (Math.abs(scrollContainer.scrollLeft - targetScrollLeft) > 1) {
        scrollContainer.scrollLeft = targetScrollLeft;
        hasInitiallyScrolledRef.current = true;
      }
    };

    // Delay slightly to ensure layout is stable
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToPosition);
    }, 100);

    // Update previous hour index
    previousHourIndexRef.current = currentHourIndex;

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMobile, enabled, currentHourIndex, totalHours, scrollContainerRef]);

  // Reset scroll tracking when disabled or date changes
  useEffect(() => {
    if (!enabled) {
      hasInitiallyScrolledRef.current = false;
      previousHourIndexRef.current = null;
    }
  }, [enabled]);
}

