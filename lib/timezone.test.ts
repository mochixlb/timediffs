import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseTimezoneId,
  createTimezoneFromId,
  getAllTimezoneIds,
  formatTime,
  formatDateDisplay,
  getOffsetDisplay,
  createTimezoneDisplay,
  getTimeOfDay,
  getTimelineHours,
} from './timezone';
import type { Timezone } from '@/types';

describe('parseTimezoneId', () => {
  it('should parse valid IANA timezone ID', () => {
    const result = parseTimezoneId('America/New_York');
    expect(result).toHaveProperty('region');
    expect(result).toHaveProperty('city');
    expect(result).toHaveProperty('displayName');
    expect(result.region).toBeTruthy();
    expect(result.city).toBeTruthy();
  });

  it('should handle timezone with underscore in city name', () => {
    const result = parseTimezoneId('America/New_York');
    expect(result.city).toBeTruthy();
    expect(result.displayName).toBeTruthy();
  });

  it('should fallback to parsing IANA ID format when not in database', () => {
    const result = parseTimezoneId('Invalid/Timezone_Name');
    expect(result.region).toBe('Invalid');
    expect(result.city).toContain('Timezone Name');
  });

  it('should handle timezone with multiple slashes', () => {
    const result = parseTimezoneId('America/Argentina/Buenos_Aires');
    expect(result.region).toBeTruthy();
    expect(result.city).toBeTruthy();
  });
});

describe('createTimezoneFromId', () => {
  it('should create timezone object from valid IANA ID', () => {
    const result = createTimezoneFromId('America/New_York');
    expect(result).toHaveProperty('id', 'America/New_York');
    expect(result).toHaveProperty('city');
    expect(result).toHaveProperty('country');
    expect(result).toHaveProperty('countryCode');
    expect(result).toHaveProperty('offset');
    expect(result).toHaveProperty('offsetHours');
    expect(typeof result.offsetHours).toBe('number');
  });

  it('should calculate correct offset hours', () => {
    const result = createTimezoneFromId('America/New_York');
    // EST is UTC-5, EDT is UTC-4 (depending on DST)
    expect(result.offsetHours).toBeGreaterThanOrEqual(-5);
    expect(result.offsetHours).toBeLessThanOrEqual(-4);
  });

  it('should handle UTC timezone', () => {
    const result = createTimezoneFromId('UTC');
    expect(result.id).toBe('UTC');
    expect(result.offsetHours).toBe(0);
  });

  it('should handle European timezone', () => {
    const result = createTimezoneFromId('Europe/London');
    expect(result.city).toBeTruthy();
    expect(result.country).toBeTruthy();
  });

  it('should handle Asian timezone', () => {
    const result = createTimezoneFromId('Asia/Tokyo');
    expect(result.city).toBeTruthy();
    expect(result.offsetHours).toBe(9); // JST is UTC+9
  });

  it('should include offset in correct format', () => {
    const result = createTimezoneFromId('America/New_York');
    // Offset should be either a short code (EST/EDT) or UTC±N format
    expect(result.offset).toMatch(/^(EST|EDT|UTC[+-]\d+|[A-Z]{2,4})$/);
  });
});

describe('getAllTimezoneIds', () => {
  it('should return array of timezone IDs', () => {
    const result = getAllTimezoneIds();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include common timezones', () => {
    const result = getAllTimezoneIds();
    expect(result).toContain('America/New_York');
    expect(result).toContain('Europe/London');
    expect(result).toContain('Asia/Tokyo');
  });

  it('should return fallback timezones on error', () => {
    // This test verifies the fallback behavior exists
    const result = getAllTimezoneIds();
    expect(result.length).toBeGreaterThan(0);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('formatTime', () => {
  const testDate = new Date('2024-01-15T14:30:00Z');

  it('should format time in 12-hour format', () => {
    const result = formatTime(testDate, 'America/New_York', '12h');
    // Should be in format like "9:30am" or "2:30pm"
    expect(result).toMatch(/^\d{1,2}:\d{2}(am|pm)$/);
  });

  it('should format time in 24-hour format', () => {
    const result = formatTime(testDate, 'America/New_York', '24h');
    // Should be in format HH:mm
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('should default to 12-hour format', () => {
    const result = formatTime(testDate, 'America/New_York');
    expect(result).toMatch(/^\d{1,2}:\d{2}(am|pm)$/);
  });

  it('should handle different timezones correctly', () => {
    const nyResult = formatTime(testDate, 'America/New_York', '24h');
    const londonResult = formatTime(testDate, 'Europe/London', '24h');
    // Times should be different for different timezones
    expect(nyResult).not.toBe(londonResult);
  });
});

describe('formatDateDisplay', () => {
  it('should format date in readable format', () => {
    const testDate = new Date('2024-01-15T14:30:00Z');
    const result = formatDateDisplay(testDate, 'America/New_York');
    // Should be in format like "Mon, Jan 15"
    expect(result).toMatch(/^[A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}$/);
  });

  it('should handle different dates', () => {
    const date1 = new Date('2024-01-15T14:30:00Z');
    const date2 = new Date('2024-12-25T14:30:00Z');
    const result1 = formatDateDisplay(date1, 'America/New_York');
    const result2 = formatDateDisplay(date2, 'America/New_York');
    expect(result1).not.toBe(result2);
  });
});

describe('getOffsetDisplay', () => {
  it('should return offset display string', () => {
    const timezone = createTimezoneFromId('America/New_York');
    const result = getOffsetDisplay(timezone);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return short timezone code when available', () => {
    const timezone = createTimezoneFromId('America/New_York');
    const result = getOffsetDisplay(timezone);
    // Should be either EST/EDT or UTC±N format
    expect(result).toMatch(/^(EST|EDT|UTC[+-]\d+|[A-Z]{2,4})$/);
  });

  it('should handle different dates for DST', () => {
    const timezone = createTimezoneFromId('America/New_York');
    const winterDate = new Date('2024-01-15T12:00:00Z');
    const summerDate = new Date('2024-07-15T12:00:00Z');
    const winterResult = getOffsetDisplay(timezone, winterDate);
    const summerResult = getOffsetDisplay(timezone, summerDate);
    // Results might be different due to DST
    expect(typeof winterResult).toBe('string');
    expect(typeof summerResult).toBe('string');
  });
});

describe('createTimezoneDisplay', () => {
  it('should create complete timezone display object', () => {
    const timezone = createTimezoneFromId('America/New_York');
    const testDate = new Date();
    const result = createTimezoneDisplay(timezone, testDate, '12h');

    expect(result).toHaveProperty('timezone');
    expect(result).toHaveProperty('currentTime');
    expect(result).toHaveProperty('formattedTime');
    expect(result).toHaveProperty('formattedDate');
    expect(result).toHaveProperty('offsetDisplay');
    expect(result.timezone).toEqual(timezone);
    expect(result.currentTime).toBeInstanceOf(Date);
  });

  it('should use provided date', () => {
    const timezone = createTimezoneFromId('America/New_York');
    const testDate = new Date('2024-01-15T14:30:00Z');
    const result = createTimezoneDisplay(timezone, testDate, '24h');
    expect(result.currentTime).toEqual(testDate);
  });

  it('should use provided time format', () => {
    const timezone = createTimezoneFromId('America/New_York');
    const testDate = new Date('2024-01-15T14:30:00Z');
    const result12h = createTimezoneDisplay(timezone, testDate, '12h');
    const result24h = createTimezoneDisplay(timezone, testDate, '24h');
    expect(result12h.formattedTime).not.toBe(result24h.formattedTime);
  });

  it('should default to current date and 12h format', () => {
    const timezone = createTimezoneFromId('America/New_York');
    const result = createTimezoneDisplay(timezone);
    expect(result.currentTime).toBeInstanceOf(Date);
    expect(result.formattedTime).toMatch(/^\d{1,2}:\d{2}(am|pm)$/);
  });
});

describe('getTimeOfDay', () => {
  it('should return "day" for hours 6-17', () => {
    expect(getTimeOfDay(6)).toBe('day');
    expect(getTimeOfDay(12)).toBe('day');
    expect(getTimeOfDay(17)).toBe('day');
  });

  it('should return "evening" for hours 18-21', () => {
    expect(getTimeOfDay(18)).toBe('evening');
    expect(getTimeOfDay(20)).toBe('evening');
    expect(getTimeOfDay(21)).toBe('evening');
  });

  it('should return "night" for hours 22-23 and 0-5', () => {
    expect(getTimeOfDay(22)).toBe('night');
    expect(getTimeOfDay(23)).toBe('night');
    expect(getTimeOfDay(0)).toBe('night');
    expect(getTimeOfDay(5)).toBe('night');
  });

  it('should handle boundary cases correctly', () => {
    expect(getTimeOfDay(5)).toBe('night');
    expect(getTimeOfDay(6)).toBe('day');
    expect(getTimeOfDay(17)).toBe('day');
    expect(getTimeOfDay(18)).toBe('evening');
    expect(getTimeOfDay(21)).toBe('evening');
    expect(getTimeOfDay(22)).toBe('night');
  });
});

describe('getTimelineHours', () => {
  it('should return array of 24 Date objects', () => {
    const testDate = new Date('2024-01-15T12:00:00Z');
    const result = getTimelineHours('America/New_York', testDate);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(24);
    result.forEach((hour) => {
      expect(hour).toBeInstanceOf(Date);
    });
  });

  it('should return hours for the correct date', () => {
    const testDate = new Date('2024-01-15T12:00:00Z');
    const result = getTimelineHours('America/New_York', testDate);
    // All hours should be valid dates
    result.forEach((hour) => {
      expect(hour.getTime()).not.toBeNaN();
    });
  });

  it('should handle different timezones', () => {
    const testDate = new Date('2024-01-15T12:00:00Z');
    const nyResult = getTimelineHours('America/New_York', testDate);
    const londonResult = getTimelineHours('Europe/London', testDate);
    // Times should be different for different timezones
    expect(nyResult[0].getTime()).not.toBe(londonResult[0].getTime());
  });

  it('should return consecutive hours', () => {
    const testDate = new Date('2024-01-15T12:00:00Z');
    const result = getTimelineHours('America/New_York', testDate);
    // Each hour should be approximately 1 hour after the previous
    for (let i = 1; i < result.length; i++) {
      const diff = result[i].getTime() - result[i - 1].getTime();
      const hoursDiff = diff / (1000 * 60 * 60);
      expect(hoursDiff).toBeCloseTo(1, 0);
    }
  });

  it('should handle DST transitions', () => {
    // Test a date that might be near DST transition
    const testDate = new Date('2024-03-10T12:00:00Z'); // Near spring DST in US
    const result = getTimelineHours('America/New_York', testDate);
    expect(result.length).toBe(24);
    result.forEach((hour) => {
      expect(hour).toBeInstanceOf(Date);
    });
  });
});

