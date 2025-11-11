import { useMemo } from "react";
import { formatInTimeZone } from "date-fns-tz";

interface UseColumnHighlightParams {
  referenceTimezone: { timezone: { id: string } } | undefined;
  referenceHours: Date[];
  now: Date;
  hoveredColumnIndex: number | null;
  shouldHighlightCurrentTime?: boolean;
}

/**
 * Custom hook to calculate the current time column and determine
 * which column should be highlighted (hover takes priority over current time).
 * Only highlights current time if shouldHighlightCurrentTime is true.
 */
export function useColumnHighlight({
  referenceTimezone,
  referenceHours,
  now,
  hoveredColumnIndex,
  shouldHighlightCurrentTime = true,
}: UseColumnHighlightParams) {
  // Calculate the current time column index
  const currentTimeColumnIndex = useMemo((): number | null => {
    if (
      !referenceTimezone ||
      referenceHours.length === 0 ||
      !shouldHighlightCurrentTime
    ) {
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
  }, [referenceTimezone, referenceHours, now, shouldHighlightCurrentTime]);

  // Determine which column to highlight (hovered or current time)
  const highlightedColumnIndex =
    hoveredColumnIndex !== null ? hoveredColumnIndex : currentTimeColumnIndex;

  return {
    highlightedColumnIndex,
  };
}
