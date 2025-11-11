import { formatInTimeZone } from "date-fns-tz";
import type { Timezone, TimezoneDisplay, TimezoneId } from "@/types";

export const POPULAR_TIMEZONES: Timezone[] = [
  {
    id: "America/New_York",
    city: "New York",
    country: "United States",
    countryCode: "US",
    offset: "EST",
    offsetHours: -5,
  },
  {
    id: "America/Los_Angeles",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    offset: "PST",
    offsetHours: -8,
  },
  {
    id: "Europe/London",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    offset: "GMT",
    offsetHours: 0,
  },
];

export function getTimezoneById(id: TimezoneId): Timezone | undefined {
  return POPULAR_TIMEZONES.find((tz) => tz.id === id);
}

export function formatTime(date: Date, timezoneId: TimezoneId): string {
  return formatInTimeZone(date, timezoneId, "h:mma").toLowerCase();
}

export function formatDateDisplay(date: Date, timezoneId: TimezoneId): string {
  return formatInTimeZone(date, timezoneId, "EEE, MMM d");
}

export function getOffsetDisplay(
  timezone: Timezone,
  date: Date = new Date()
): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone.id,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(date);
  const timeZoneName =
    parts.find((part) => part.type === "timeZoneName")?.value || "";

  if (
    timeZoneName &&
    timeZoneName.length <= 4 &&
    /^[A-Z]+$/.test(timeZoneName)
  ) {
    return timeZoneName;
  }

  const utcTime = date.getTime();
  const tzTime = new Date(
    date.toLocaleString("en-US", { timeZone: timezone.id })
  ).getTime();
  const utcTime2 = new Date(
    date.toLocaleString("en-US", { timeZone: "UTC" })
  ).getTime();
  const offsetMs = tzTime - utcTime2;
  const offsetHours = offsetMs / (1000 * 60 * 60);

  const sign = offsetHours >= 0 ? "+" : "";
  return `${sign}${Math.round(offsetHours)}`;
}

export function createTimezoneDisplay(
  timezone: Timezone,
  selectedDate: Date = new Date()
): TimezoneDisplay {
  const formattedTime = formatTime(selectedDate, timezone.id);
  const formattedDate = formatDateDisplay(selectedDate, timezone.id);
  const offsetDisplay = getOffsetDisplay(timezone, selectedDate);

  return {
    timezone,
    currentTime: selectedDate,
    formattedTime,
    formattedDate,
    offsetDisplay,
  };
}

export function getTimeOfDay(hour: number): "day" | "evening" | "night" {
  if (hour >= 6 && hour < 18) {
    return "day";
  }
  if (hour >= 18 && hour < 22) {
    return "evening";
  }
  return "night";
}

export function getTimelineHours(timezoneId: TimezoneId, date: Date): Date[] {
  const hours: Date[] = [];

  // Get the current date string in the target timezone (e.g., "2024-01-15")
  const dateStr = formatInTimeZone(date, timezoneId, "yyyy-MM-dd");

  // Find the UTC time that represents midnight (00:00) of the current date in the target timezone
  // We'll use a binary search-like approach: start with midnight UTC and adjust

  // First, find what UTC time corresponds to midnight (hour 0) on dateStr in the timezone
  // Try different UTC times until we find one that formats to hour 0 on the correct date
  let midnightUtc: Date | null = null;

  // Start with midnight UTC on the date string
  let candidate = new Date(`${dateStr}T00:00:00Z`);

  // Check up to 48 hours forward/backward to account for timezone offsets
  for (let offset = -24; offset <= 24; offset++) {
    const testDate = new Date(candidate.getTime() + offset * 60 * 60 * 1000);
    const testDateStr = formatInTimeZone(testDate, timezoneId, "yyyy-MM-dd");
    const testHour = parseInt(formatInTimeZone(testDate, timezoneId, "H"), 10);

    if (testDateStr === dateStr && testHour === 0) {
      midnightUtc = testDate;
      break;
    }
  }

  // Fallback: if we didn't find it, use a calculated approach
  if (!midnightUtc) {
    // Get the timezone offset by checking what hour midnight UTC shows as
    const tzHourAtMidnightUtc = parseInt(
      formatInTimeZone(candidate, timezoneId, "H"),
      10
    );
    const tzDateAtMidnightUtc = formatInTimeZone(
      candidate,
      timezoneId,
      "yyyy-MM-dd"
    );

    if (tzDateAtMidnightUtc === dateStr) {
      // Midnight UTC is on the same date, adjust backward by tzHourAtMidnightUtc
      midnightUtc = new Date(
        candidate.getTime() - tzHourAtMidnightUtc * 60 * 60 * 1000
      );
    } else {
      // Midnight UTC is on a different date, need to adjust forward
      const daysDiff = dateStr > tzDateAtMidnightUtc ? 1 : -1;
      midnightUtc = new Date(
        candidate.getTime() +
          daysDiff * 24 * 60 * 60 * 1000 -
          tzHourAtMidnightUtc * 60 * 60 * 1000
      );
    }
  }

  // Now create 24 hours starting from midnight in the target timezone
  for (let i = 0; i < 24; i++) {
    if (midnightUtc) {
      const hourDate = new Date(midnightUtc.getTime() + i * 60 * 60 * 1000);
      hours.push(hourDate);
    }
  }

  return hours;
}
