import { useMemo } from "react";
import { formatInTimeZone } from "date-fns-tz";

interface UseExactTimePositionParams {
  referenceTimezone: { timezone: { id: string } } | undefined;
  referenceHours: Date[];
  now: Date;
  shouldShow: boolean;
}

interface ExactTimePosition {
  columnIndex: number | null;
  offsetPercentage: number; // 0-100, position within the hour column
  exactTimeInTimezone: Date | null;
}

/**
 * Custom hook to calculate the exact position of the current time within the timeline.
 * Returns the column index and the precise offset within that column (0-100%).
 * Only calculates if shouldShow is true.
 */
export function useExactTimePosition({
  referenceTimezone,
  referenceHours,
  now,
  shouldShow,
}: UseExactTimePositionParams): ExactTimePosition {
  return useMemo(() => {
    if (
      !referenceTimezone ||
      referenceHours.length === 0 ||
      !shouldShow
    ) {
      return {
        columnIndex: null,
        offsetPercentage: 0,
        exactTimeInTimezone: null,
      };
    }

    // Get the current time components in the reference timezone
    const refCurrentHour = parseInt(
      formatInTimeZone(now, referenceTimezone.timezone.id, "H"),
      10
    );
    const refCurrentMinute = parseInt(
      formatInTimeZone(now, referenceTimezone.timezone.id, "m"),
      10
    );
    const refCurrentSecond = parseInt(
      formatInTimeZone(now, referenceTimezone.timezone.id, "s"),
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

    if (currentHourIndex === -1) {
      return {
        columnIndex: null,
        offsetPercentage: 0,
        exactTimeInTimezone: null,
      };
    }

    // Calculate the offset percentage within the hour column
    // Minutes (0-59) + seconds (0-59) / 60 = total fraction of hour
    const totalMinutes = refCurrentMinute + refCurrentSecond / 60;
    const offsetPercentage = (totalMinutes / 60) * 100;

    // Create a Date object representing the exact time in the reference timezone
    // This is used for formatting the time label
    const exactTimeInTimezone = new Date(now);

    return {
      columnIndex: currentHourIndex,
      offsetPercentage,
      exactTimeInTimezone,
    };
  }, [referenceTimezone, referenceHours, now, shouldShow]);
}

