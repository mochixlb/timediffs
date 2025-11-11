import { formatInTimeZone } from "date-fns-tz";
import type { Timezone, TimezoneDisplay, TimezoneId } from "@/types";

/**
 * Parses an IANA timezone ID (e.g., "America/New_York") and extracts
 * the city name and region for display purposes.
 */
export function parseTimezoneId(timezoneId: string): {
  region: string;
  city: string;
  displayName: string;
} {
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
 * Uses Intl API to get current offset information.
 */
export function createTimezoneFromId(timezoneId: TimezoneId): Timezone {
  const { region, displayName } = parseTimezoneId(timezoneId);
  const now = new Date();

  // Get offset using Intl API - more accurate method
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezoneId,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(now);
  const timeZoneName =
    parts.find((part) => part.type === "timeZoneName")?.value || "";

  // Calculate offset hours - matches the approach used in getOffsetDisplay
  const tzTimeStr = now.toLocaleString("en-US", { timeZone: timezoneId });
  const utcTimeStr = now.toLocaleString("en-US", { timeZone: "UTC" });
  const tzTime = new Date(tzTimeStr).getTime();
  const utcTime = new Date(utcTimeStr).getTime();
  const offsetMs = tzTime - utcTime;
  const offsetHours = Math.round(offsetMs / (1000 * 60 * 60));

  // Try to infer country code from region (basic mapping)
  const countryCode = getCountryCodeFromRegion(region);

  return {
    id: timezoneId,
    city: displayName,
    country: getCountryNameFromRegion(region),
    countryCode,
    offset:
      timeZoneName.length <= 4 && /^[A-Z]+$/.test(timeZoneName)
        ? timeZoneName
        : `UTC${offsetHours >= 0 ? "+" : ""}${offsetHours}`,
    offsetHours,
  };
}

/**
 * Gets all available timezone IDs from the browser's Intl API.
 */
export function getAllTimezoneIds(): string[] {
  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      // Fallback if not supported
    }
  }
  return [];
}

/**
 * Basic mapping of region to country code (simplified).
 * For a more comprehensive solution, consider using @vvo/tzdb.
 */
function getCountryCodeFromRegion(region: string): string {
  const regionMap: Record<string, string> = {
    America: "US",
    Europe: "GB",
    Asia: "CN",
    Africa: "ZA",
    Australia: "AU",
    Pacific: "NZ",
    Atlantic: "GB",
    Indian: "IN",
    Arctic: "NO",
    Antarctica: "AQ",
  };
  return regionMap[region] || "XX";
}

/**
 * Basic mapping of region to country name (simplified).
 */
function getCountryNameFromRegion(region: string): string {
  const regionMap: Record<string, string> = {
    America: "United States",
    Europe: "Europe",
    Asia: "Asia",
    Africa: "Africa",
    Australia: "Australia",
    Pacific: "Pacific",
    Atlantic: "Atlantic",
    Indian: "Indian Ocean",
    Arctic: "Arctic",
    Antarctica: "Antarctica",
  };
  return regionMap[region] || region;
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
