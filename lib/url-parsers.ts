import { createSearchParamsCache, parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs";

/**
 * URL parsers for timezone comparison state.
 * These parsers handle serialization/deserialization of state to/from URL query parameters.
 */

/**
 * Parser for timezone IDs array.
 * Serializes as comma-separated string: "America/New_York,Europe/London"
 * Parses back to array, filtering out empty strings.
 */
export const parseAsTimezoneArray = parseAsArrayOf(parseAsString).withDefault([]);

/**
 * Parser for date selection.
 * Serializes as ISO date string: "2024-01-15"
 * Parses back to Date object, defaulting to today if invalid.
 */
export const parseAsDate = {
  parse: (value: string): Date => {
    // Validate ISO date string format (YYYY-MM-DD)
    const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
      return new Date();
    }
    
    const [, year, month, day] = dateMatch;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    
    // Validate date - if invalid, return today
    if (isNaN(date.getTime())) {
      return new Date();
    }
    
    // Reset time to start of day
    date.setHours(0, 0, 0, 0);
    return date;
  },
  serialize: (value: Date): string => {
    // Serialize as YYYY-MM-DD format
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
  withDefault: (defaultValue: Date) => ({
    parse: parseAsDate.parse,
    serialize: parseAsDate.serialize,
    defaultValue,
  }),
};

/**
 * Parser for time format selection.
 * Only accepts "12h" or "24h" values.
 */
export const parseAsTimeFormat = parseAsStringEnum(["12h", "24h"] as const).withDefault("12h");

/**
 * Parser for home timezone ID.
 * Single string value, optional (can be null).
 */
export const parseAsHomeTimezone = parseAsString;

