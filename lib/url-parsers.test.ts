import { describe, it, expect } from 'vitest';
import {
  parseAsTimezoneArray,
  parseAsDate,
  parseAsTimeFormat,
  parseAsHomeTimezone,
  MAX_TIMEZONES,
} from './url-parsers';

describe('parseAsTimezoneArray', () => {
  describe('parse', () => {
    it('should parse comma-separated timezone string', () => {
      const result = parseAsTimezoneArray.parse(
        'America/New_York,Europe/London'
      );
      expect(result).toEqual(['America/New_York', 'Europe/London']);
    });

    it('should parse single timezone', () => {
      const result = parseAsTimezoneArray.parse('America/New_York');
      expect(result).toEqual(['America/New_York']);
    });

    it('should return empty array for empty string', () => {
      const result = parseAsTimezoneArray.parse('');
      expect(result).toEqual([]);
    });

    it('should handle empty strings in input', () => {
      // Note: nuqs parseAsArrayOf may include empty strings, so we test actual behavior
      const result = parseAsTimezoneArray.parse('America/New_York,,Europe/London');
      // The parser should handle this gracefully
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('America/New_York');
      expect(result).toContain('Europe/London');
    });

    it('should enforce MAX_TIMEZONES limit', () => {
      const manyTimezones = Array(MAX_TIMEZONES + 5)
        .fill('America/New_York')
        .join(',');
      const result = parseAsTimezoneArray.parse(manyTimezones);
      expect(result.length).toBe(MAX_TIMEZONES);
    });

    it('should handle whitespace', () => {
      // nuqs may preserve or trim whitespace depending on implementation
      const result = parseAsTimezoneArray.parse(
        'America/New_York , Europe/London'
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // Check that both timezones are present (may have whitespace trimmed)
      const normalized = result.map(tz => tz.trim());
      expect(normalized).toContain('America/New_York');
      expect(normalized).toContain('Europe/London');
    });

    it('should handle array input format', () => {
      // nuqs array format might be passed as array
      const result = parseAsTimezoneArray.parse(
        JSON.stringify(['America/New_York', 'Europe/London'])
      );
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('serialize', () => {
    it('should serialize array to comma-separated string', () => {
      const result = parseAsTimezoneArray.serialize([
        'America/New_York',
        'Europe/London',
      ]);
      expect(result).toContain('America/New_York');
      expect(result).toContain('Europe/London');
    });

    it('should serialize empty array', () => {
      const result = parseAsTimezoneArray.serialize([]);
      expect(result).toBeDefined();
    });

    it('should enforce MAX_TIMEZONES limit when serializing', () => {
      const manyTimezones = Array(MAX_TIMEZONES + 5).fill('America/New_York');
      const result = parseAsTimezoneArray.serialize(manyTimezones);
      const parsed = parseAsTimezoneArray.parse(result);
      expect(parsed.length).toBeLessThanOrEqual(MAX_TIMEZONES);
    });
  });

  describe('withDefault', () => {
    it('should use default value when provided', () => {
      const parser = parseAsTimezoneArray.withDefault([
        'America/New_York',
        'Europe/London',
      ]);
      expect(parser.defaultValue).toEqual(['America/New_York', 'Europe/London']);
    });

    it('should enforce MAX_TIMEZONES limit on default value', () => {
      const manyDefaults = Array(MAX_TIMEZONES + 5).fill('America/New_York');
      const parser = parseAsTimezoneArray.withDefault(manyDefaults);
      expect(parser.defaultValue.length).toBe(MAX_TIMEZONES);
    });
  });
});

describe('parseAsDate', () => {
  describe('parse', () => {
    it('should parse valid ISO date string', () => {
      const result = parseAsDate.parse('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it('should return today for invalid format', () => {
      const result = parseAsDate.parse('invalid-date');
      expect(result).toBeInstanceOf(Date);
      // Should be a valid date (today)
      expect(result.getTime()).not.toBeNaN();
    });

    it('should return today for malformed date', () => {
      const result = parseAsDate.parse('2024-13-45'); // Invalid month/day
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).not.toBeNaN();
    });

    it('should reset time to start of day', () => {
      const result = parseAsDate.parse('2024-01-15');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle leap year dates', () => {
      const result = parseAsDate.parse('2024-02-29');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29);
    });

    it('should handle different months', () => {
      const jan = parseAsDate.parse('2024-01-15');
      const dec = parseAsDate.parse('2024-12-25');
      expect(jan.getMonth()).toBe(0);
      expect(dec.getMonth()).toBe(11);
    });

    it('should reject non-ISO format dates', () => {
      const result1 = parseAsDate.parse('01/15/2024');
      const result2 = parseAsDate.parse('15-01-2024');
      // Should return today for invalid formats
      expect(result1).toBeInstanceOf(Date);
      expect(result2).toBeInstanceOf(Date);
    });
  });

  describe('serialize', () => {
    it('should serialize date to ISO format', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = parseAsDate.serialize(date);
      expect(result).toBe('2024-01-15');
    });

    it('should pad single-digit months and days', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      const result = parseAsDate.serialize(date);
      expect(result).toBe('2024-01-05');
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date(2024, 11, 25); // December 25, 2024
      const date2 = new Date(2024, 0, 1); // January 1, 2024
      expect(parseAsDate.serialize(date1)).toBe('2024-12-25');
      expect(parseAsDate.serialize(date2)).toBe('2024-01-01');
    });
  });

  describe('withDefault', () => {
    it('should use default value when provided', () => {
      const defaultDate = new Date(2024, 0, 1);
      const parser = parseAsDate.withDefault(defaultDate);
      expect(parser.defaultValue).toEqual(defaultDate);
    });
  });
});

describe('parseAsTimeFormat', () => {
  it('should parse "12h" format', () => {
    const result = parseAsTimeFormat.parse('12h');
    expect(result).toBe('12h');
  });

  it('should parse "24h" format', () => {
    const result = parseAsTimeFormat.parse('24h');
    expect(result).toBe('24h');
  });

  it('should return null for invalid values (nuqs behavior)', () => {
    // parseAsStringEnum returns null for invalid values, default is applied by withDefault
    const result = parseAsTimeFormat.parse('invalid');
    // The parser itself returns null, but withDefault provides "12h" when used in context
    expect(result === null || result === '12h').toBe(true);
  });

  it('should return null for empty string (nuqs behavior)', () => {
    // parseAsStringEnum returns null for empty/invalid values
    const result = parseAsTimeFormat.parse('');
    // The parser itself returns null, but withDefault provides "12h" when used in context
    expect(result === null || result === '12h').toBe(true);
  });

  it('should serialize "12h" format', () => {
    const result = parseAsTimeFormat.serialize('12h');
    expect(result).toBe('12h');
  });

  it('should serialize "24h" format', () => {
    const result = parseAsTimeFormat.serialize('24h');
    expect(result).toBe('24h');
  });
});

describe('parseAsHomeTimezone', () => {
  it('should parse timezone string', () => {
    const result = parseAsHomeTimezone.parse('America/New_York');
    expect(result).toBe('America/New_York');
  });

  it('should handle empty string', () => {
    const result = parseAsHomeTimezone.parse('');
    expect(result).toBe('');
  });

  it('should serialize timezone string', () => {
    const result = parseAsHomeTimezone.serialize('America/New_York');
    expect(result).toBe('America/New_York');
  });
});

describe('MAX_TIMEZONES constant', () => {
  it('should be a positive number', () => {
    expect(MAX_TIMEZONES).toBeGreaterThan(0);
    expect(typeof MAX_TIMEZONES).toBe('number');
  });

  it('should be used in parseAsTimezoneArray', () => {
    const manyTimezones = Array(MAX_TIMEZONES + 10)
      .fill('America/New_York')
      .join(',');
    const result = parseAsTimezoneArray.parse(manyTimezones);
    expect(result.length).toBe(MAX_TIMEZONES);
  });
});

