"use client";

import { motion, type Transition } from "framer-motion";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { formatTime } from "@/lib/timezone";
import { useTimezone } from "@/contexts/timezone-context";
import type { ExactTimePosition } from "@/hooks/use-exact-time-position";

interface ExactTimeIndicatorProps {
  position: ExactTimePosition;
  totalColumns: number;
  referenceTimezoneId: string;
}

interface FlexContainerMeasurements {
  left: number;
  width: number;
}

// Animation configuration for smooth time updates
const INDICATOR_TRANSITION: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.3,
};

/**
 * Displays a vertical line and time label showing the exact current time position
 * within the timeline. Only visible when viewing today's date.
 * 
 * The indicator shows:
 * - A thin vertical line positioned precisely within the hour column
 * - A small badge/label above the timeline showing the exact time
 */
export function ExactTimeIndicator({
  position,
  totalColumns,
  referenceTimezoneId,
}: ExactTimeIndicatorProps) {
  const isMobile = useIsMobile();
  const { timeFormat } = useTimezone();
  const [measurements, setMeasurements] =
    useState<FlexContainerMeasurements | null>(null);

  // Measure the flex container's actual position and width
  useEffect(() => {
    const measureContainer = () => {
      const flexContainer = document.querySelector(
        "[data-timeline-flex-container]"
      ) as HTMLElement;

      if (!flexContainer) return;

      const parentContainer = document.querySelector(
        "[data-timeline-container]"
      ) as HTMLElement;

      if (!parentContainer) return;

      const containerRect = flexContainer.getBoundingClientRect();
      const parentRect = parentContainer.getBoundingClientRect();

      setMeasurements({
        left: containerRect.left - parentRect.left,
        width: flexContainer.offsetWidth,
      });
    };

    measureContainer();
    window.addEventListener("resize", measureContainer);

    // Re-measure after a short delay to ensure layout is complete
    const timeoutId = setTimeout(measureContainer, 100);

    return () => {
      window.removeEventListener("resize", measureContainer);
      clearTimeout(timeoutId);
    };
  }, [position.columnIndex, totalColumns]);

  // Hide if no position data, on mobile, or if measurements aren't ready
  if (
    isMobile ||
    position.columnIndex === null ||
    !position.exactTimeInTimezone ||
    totalColumns === 0 ||
    !measurements
  ) {
    return null;
  }

  // Calculate exact position in pixels
  const columnWidth = measurements.width / totalColumns;
  const columnLeft = measurements.left + position.columnIndex * columnWidth;
  const offsetInPixels = (position.offsetPercentage / 100) * columnWidth;
  const exactLeft = columnLeft + offsetInPixels;

  // Format the exact time for display
  const formattedTime = formatTime(
    position.exactTimeInTimezone,
    referenceTimezoneId,
    timeFormat
  );

  return (
    <>
      {/* Time label badge above the timeline */}
      <motion.div
        className="absolute pointer-events-none z-40"
        initial={false}
        animate={{
          left: exactLeft,
          opacity: 1,
        }}
        transition={INDICATOR_TRANSITION}
        style={{
          top: -32,
          transform: "translateX(-50%)",
        }}
      >
        <div className="px-2 py-1 bg-slate-900 text-white text-xs font-medium rounded-md shadow-sm whitespace-nowrap">
          {formattedTime}
        </div>
        {/* Small arrow pointing down */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
      </motion.div>

      {/* Vertical line indicating exact time position */}
      <motion.div
        className="absolute pointer-events-none z-40"
        initial={false}
        animate={{
          left: exactLeft,
          opacity: 0.8,
        }}
        transition={INDICATOR_TRANSITION}
        style={{
          top: 0,
          bottom: 0,
        }}
      >
        <div className="h-full w-0.5 bg-slate-900" />
      </motion.div>
    </>
  );
}

