import { useState, useRef, useCallback } from "react";

/**
 * Custom hook to handle timeline hover interactions using refs.
 * Replaces direct DOM manipulation with proper React patterns.
 */
export function useTimelineHover(totalColumns: number) {
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(
    null
  );
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineContainerRef.current) return;

      // Find the first timeline flex container to measure width
      const flexContainer = timelineContainerRef.current.querySelector(
        "[data-timeline-flex-container]"
      ) as HTMLElement;

      if (!flexContainer) return;

      const rect = flexContainer.getBoundingClientRect();
      const mouseX = e.clientX;

      // Check if mouse is within the container horizontally
      if (mouseX >= rect.left && mouseX <= rect.right) {
        const relativeX = mouseX - rect.left;
        const columnWidth = rect.width / totalColumns;
        const columnIndex = Math.floor(relativeX / columnWidth);

        if (columnIndex >= 0 && columnIndex < totalColumns) {
          setHoveredColumnIndex(columnIndex);
        }
      } else {
        setHoveredColumnIndex(null);
      }
    },
    [totalColumns]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredColumnIndex(null);
  }, []);

  return {
    timelineContainerRef,
    hoveredColumnIndex,
    handleMouseMove,
    handleMouseLeave,
  };
}
