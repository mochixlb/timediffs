"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useIsMobile } from "./use-is-mobile";

/**
 * Enhanced hook to handle both mouse hover and touch interactions on the timeline
 * Provides mobile-friendly alternatives to hover effects
 */
export function useTimelineTouch(totalColumns: number) {
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
  const [touchedColumnIndex, setTouchedColumnIndex] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  // Get the active column index (touch takes precedence on mobile)
  const activeColumnIndex = isMobile ? touchedColumnIndex : (hoveredColumnIndex ?? touchedColumnIndex);

  const getColumnFromPosition = useCallback(
    (clientX: number): number | null => {
      if (!timelineContainerRef.current) return null;

      const flexContainer = timelineContainerRef.current.querySelector(
        "[data-timeline-flex-container]"
      ) as HTMLElement;

      if (!flexContainer) return null;

      const rect = flexContainer.getBoundingClientRect();
      
      if (clientX >= rect.left && clientX <= rect.right) {
        const relativeX = clientX - rect.left;
        const columnWidth = rect.width / totalColumns;
        const columnIndex = Math.floor(relativeX / columnWidth);

        if (columnIndex >= 0 && columnIndex < totalColumns) {
          return columnIndex;
        }
      }
      return null;
    },
    [totalColumns]
  );

  // Mouse handlers (desktop)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return;
      const columnIndex = getColumnFromPosition(e.clientX);
      setHoveredColumnIndex(columnIndex);
      if (columnIndex !== null) {
        setIsInteracting(true);
      }
    },
    [getColumnFromPosition, isMobile]
  );

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    setHoveredColumnIndex(null);
    setIsInteracting(false);
  }, [isMobile]);

  // Touch handlers (mobile)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const columnIndex = getColumnFromPosition(touch.clientX);
      
      if (columnIndex !== null) {
        setTouchedColumnIndex(columnIndex);
        setIsInteracting(true);

        // Trigger haptic feedback if available
        if ("vibrate" in navigator) {
          navigator.vibrate(10);
        }

        // Clear previous timeout
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }
    },
    [getColumnFromPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const columnIndex = getColumnFromPosition(touch.clientX);
      
      if (columnIndex !== null && columnIndex !== touchedColumnIndex) {
        setTouchedColumnIndex(columnIndex);
      }
    },
    [getColumnFromPosition, touchedColumnIndex]
  );

  const handleTouchEnd = useCallback(() => {
    // Keep the highlight visible for a moment after touch ends
    touchTimeoutRef.current = setTimeout(() => {
      setTouchedColumnIndex(null);
      setIsInteracting(false);
    }, 500);
  }, []);

  const handleTouchCancel = useCallback(() => {
    setTouchedColumnIndex(null);
    setIsInteracting(false);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  // Get formatted time for the active column
  const getColumnTime = useCallback(
    (columnIndex: number | null): string | null => {
      if (columnIndex === null || !timelineContainerRef.current) return null;

      // Find hour cells to get the time
      const hourCells = timelineContainerRef.current.querySelectorAll(
        "[data-hour-index]"
      );
      
      if (hourCells[columnIndex]) {
        const timeElement = hourCells[columnIndex].querySelector("[data-hour-time]");
        return timeElement?.textContent || null;
      }
      
      return null;
    },
    []
  );

  return {
    timelineContainerRef,
    hoveredColumnIndex,
    touchedColumnIndex,
    activeColumnIndex,
    isInteracting,
    handleMouseMove,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    getColumnTime,
  };
}
