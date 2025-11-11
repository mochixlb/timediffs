import { useState, useMemo } from "react";
import { formatInTimeZone } from "date-fns-tz";

interface UseColumnHighlightParams {
  referenceTimezone: { timezone: { id: string } } | undefined;
  referenceHours: Date[];
  now: Date;
}

/**
 * Custom hook to manage column highlighting logic.
 * Handles hover state and calculates the current time column index.
 */
export function useColumnHighlight({
  referenceTimezone,
  referenceHours,
  now,
}: UseColumnHighlightParams) {
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(
    null
  );

  // Calculate the current time column index
  const currentTimeColumnIndex = useMemo((): number | null => {
    if (!referenceTimezone || referenceHours.length === 0) {
      return null;
    }

    const refCurrentHour = parseInt(
      formatInTimeZone(now, referenceTimezone.timezone.id, "H"),
      10
    );
    const refCurrentDay = parseInt(
      formatInTimeZone(now, referenceTimezone.timezone.id, "d"),
      10
    );

    // Find which hour block contains the current time
    const currentHourIndex = referenceHours.findIndex((hourDate) => {
      const hourInRef = parseInt(
        formatInTimeZone(hourDate, referenceTimezone.timezone.id, "H"),
        10
      );
      const dayInRef = parseInt(
        formatInTimeZone(hourDate, referenceTimezone.timezone.id, "d"),
        10
      );
      return hourInRef === refCurrentHour && dayInRef === refCurrentDay;
    });

    return currentHourIndex === -1 ? null : currentHourIndex;
  }, [referenceTimezone, referenceHours, now]);

  // Determine which column to highlight (hovered or current time)
  const highlightedColumnIndex =
    hoveredColumnIndex !== null ? hoveredColumnIndex : currentTimeColumnIndex;

  return {
    hoveredColumnIndex,
    setHoveredColumnIndex,
    highlightedColumnIndex,
  };
}
