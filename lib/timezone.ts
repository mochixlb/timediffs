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

  const dateStr = formatInTimeZone(date, timezoneId, "yyyy-MM-dd");

  for (let i = 0; i < 24; i++) {
    const hourStr = `${dateStr}T${String(i).padStart(2, "0")}:00:00`;

    const utcDateStr = `${hourStr}Z`;
    const baseDate = new Date(utcDateStr);

    const tzFormatted = formatInTimeZone(
      baseDate,
      timezoneId,
      "yyyy-MM-dd'T'HH:mm:ss"
    );
    const tzHour = parseInt(tzFormatted.substring(11, 13), 10);

    const hourDiff = i - tzHour;
    const adjustedDate = new Date(
      baseDate.getTime() - hourDiff * 60 * 60 * 1000
    );

    hours.push(adjustedDate);
  }

  return hours;
}
