/**
 * Custom hook to determine which column should be highlighted.
 * Only highlights when the user hovers over the timeline (hoveredColumnIndex).
 * The exact time indicator handles showing the current time position.
 */
export function useColumnHighlight({
  hoveredColumnIndex,
}: {
  hoveredColumnIndex: number | null;
}) {
  // Only highlight on hover - no fallback to current time
  return {
    highlightedColumnIndex: hoveredColumnIndex,
  };
}
