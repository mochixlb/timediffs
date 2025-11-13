import { formatInTimeZone } from "date-fns-tz";
import type { Timezone, TimezoneDisplay, TimezoneId } from "@/types";
import { getTimezoneMap, getTimezoneData } from "./timezone-data";

/**
 * Parses an IANA timezone ID (e.g., "America/New_York") and extracts
 * the city name and region for display purposes.
 * Falls back to parsing the ID if not found in @vvo/tzdb.
 */
export function parseTimezoneId(timezoneId: string): {
  region: string;
  city: string;
  displayName: string;
} {
  const timezoneMap = getTimezoneMap();
  const tzData = timezoneMap.get(timezoneId);

  if (tzData) {
    // Use the first main city as the display name, or alternative name
    const city = tzData.mainCities?.[0] || tzData.alternativeName || "";
    const region = tzData.continentName || "";

    return {
      region,
      city,
      displayName: city || tzData.alternativeName || timezoneId,
    };
  }

  // Fallback: parse from IANA ID format
  const parts = timezoneId.split("/");
  const region = parts[0] || "";
  const city = parts.slice(1).join("/").replace(/_/g, " ") || "";

  return {
    region,
    city,
    displayName: city || timezoneId,
  };
}

/**
 * Creates a Timezone object from an IANA timezone ID.
 * Uses @vvo/tzdb for accurate country and city information,
 * and Intl API for current offset calculations.
 */
export function createTimezoneFromId(timezoneId: TimezoneId): Timezone {
  const timezoneMap = getTimezoneMap();
  const tzData = timezoneMap.get(timezoneId);
  const now = new Date();

  // Get current offset using Intl API (accounts for DST)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezoneId,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(now);
  const timeZoneName =
    parts.find((part) => part.type === "timeZoneName")?.value || "";

  // Calculate current offset hours (accounts for DST)
  const tzTimeStr = now.toLocaleString("en-US", { timeZone: timezoneId });
  const utcTimeStr = now.toLocaleString("en-US", { timeZone: "UTC" });
  const tzTime = new Date(tzTimeStr).getTime();
  const utcTime = new Date(utcTimeStr).getTime();
  const offsetMs = tzTime - utcTime;
  const offsetHours = Math.round(offsetMs / (1000 * 60 * 60));

  // Use @vvo/tzdb data if available, otherwise fallback to parsing
  if (tzData) {
    const city = tzData.mainCities?.[0] || tzData.alternativeName || timezoneId;
    const country = tzData.countryName || "";
    const countryCode = tzData.countryCode || "";

    return {
      id: timezoneId,
      city,
      country,
      countryCode,
      offset:
        timeZoneName.length <= 4 && /^[A-Z]+$/.test(timeZoneName)
          ? timeZoneName
          : `UTC${offsetHours >= 0 ? "+" : ""}${offsetHours}`,
      offsetHours,
    };
  }

  // Fallback: parse from IANA ID if not in @vvo/tzdb
  const { displayName } = parseTimezoneId(timezoneId);
  const partsFromId = timezoneId.split("/");
  const region = partsFromId[0] || "";

  return {
    id: timezoneId,
    city: displayName,
    country: region,
    countryCode: "XX",
    offset:
      timeZoneName.length <= 4 && /^[A-Z]+$/.test(timeZoneName)
        ? timeZoneName
        : `UTC${offsetHours >= 0 ? "+" : ""}${offsetHours}`,
    offsetHours,
  };
}

/**
 * Gets all available timezone IDs from @vvo/tzdb.
 * Returns a comprehensive list of IANA timezone identifiers.
 */
export function getAllTimezoneIds(): string[] {
  try {
    const timezones = getTimezoneData();
    return timezones.map((tz) => tz.name);
  } catch (error) {
    console.error("Failed to load timezones from @vvo/tzdb:", error);
    // Fallback to a minimal list of common timezones
    return [
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "America/Denver",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Australia/Sydney",
    ];
  }
}

export function formatTime(
  date: Date,
  timezoneId: TimezoneId,
  format: "12h" | "24h" = "12h"
): string {
  if (format === "24h") {
    return formatInTimeZone(date, timezoneId, "HH:mm");
  }
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

  const tzTime = new Date(
    date.toLocaleString("en-US", { timeZone: timezone.id })
  ).getTime();
  const utcTime = new Date(
    date.toLocaleString("en-US", { timeZone: "UTC" })
  ).getTime();
  const offsetMs = tzTime - utcTime;
  const offsetHours = offsetMs / (1000 * 60 * 60);

  const sign = offsetHours >= 0 ? "+" : "";
  return `${sign}${Math.round(offsetHours)}`;
}

export function createTimezoneDisplay(
  timezone: Timezone,
  selectedDate: Date = new Date(),
  timeFormat: "12h" | "24h" = "12h"
): TimezoneDisplay {
  const formattedTime = formatTime(selectedDate, timezone.id, timeFormat);
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
