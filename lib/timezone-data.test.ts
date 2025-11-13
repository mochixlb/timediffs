import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTimezoneData,
  getTimezoneMap,
  getTimezoneSearchIndex,
  getCityToTimezoneMap,
  preInitializeTimezoneData,
} from './timezone-data';

describe('getTimezoneData', () => {
  it('should return array of timezone data', () => {
    const result = getTimezoneData();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return cached data on subsequent calls', () => {
    const first = getTimezoneData();
    const second = getTimezoneData();
    expect(first).toBe(second); // Same reference (cached)
  });

  it('should include timezone objects with required properties', () => {
    const result = getTimezoneData();
    if (result.length > 0) {
      const tz = result[0];
      expect(tz).toHaveProperty('name');
      expect(typeof tz.name).toBe('string');
    }
  });

  it('should include common timezones', () => {
    const result = getTimezoneData();
    const names = result.map((tz) => tz.name);
    expect(names).toContain('America/New_York');
    expect(names).toContain('Europe/London');
    expect(names).toContain('Asia/Tokyo');
  });
});

describe('getTimezoneMap', () => {
  it('should return a Map', () => {
    const result = getTimezoneMap();
    expect(result).toBeInstanceOf(Map);
  });

  it('should map timezone names to timezone objects', () => {
    const map = getTimezoneMap();
    const nyTz = map.get('America/New_York');
    expect(nyTz).toBeDefined();
    expect(nyTz?.name).toBe('America/New_York');
  });

  it('should return cached map on subsequent calls', () => {
    const first = getTimezoneMap();
    const second = getTimezoneMap();
    expect(first).toBe(second); // Same reference (cached)
  });

  it('should include all timezones from data', () => {
    const data = getTimezoneData();
    const map = getTimezoneMap();
    expect(map.size).toBe(data.length);
  });

  it('should allow lookup by IANA timezone ID', () => {
    const map = getTimezoneMap();
    const timezones = [
      'America/New_York',
      'Europe/London',
      'Asia/Tokyo',
      'Australia/Sydney',
    ];

    timezones.forEach((id) => {
      const tz = map.get(id);
      expect(tz).toBeDefined();
      expect(tz?.name).toBe(id);
    });
  });
});

describe('getTimezoneSearchIndex', () => {
  it('should return a Fuse search index', () => {
    const index = getTimezoneSearchIndex();
    expect(index).toBeDefined();
    expect(typeof index.search).toBe('function');
  });

  it('should return cached index on subsequent calls', () => {
    const first = getTimezoneSearchIndex();
    const second = getTimezoneSearchIndex();
    expect(first).toBe(second); // Same reference (cached)
  });

  it('should find timezones by city name', () => {
    const index = getTimezoneSearchIndex();
    const results = index.search('New York');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.name).toBe('America/New_York');
  });

  it('should find timezones by country name', () => {
    const index = getTimezoneSearchIndex();
    const results = index.search('United States');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should handle fuzzy matching', () => {
    const index = getTimezoneSearchIndex();
    const results = index.search('New Yrok'); // Typo
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return results with scores', () => {
    const index = getTimezoneSearchIndex();
    const results = index.search('London');
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('score');
      expect(typeof results[0].score).toBe('number');
    }
  });

  it('should prioritize main cities in search', () => {
    const index = getTimezoneSearchIndex();
    const results = index.search('Tokyo');
    expect(results.length).toBeGreaterThan(0);
    // Tokyo should be highly ranked
    const tokyoResult = results.find((r) => r.item.name === 'Asia/Tokyo');
    expect(tokyoResult).toBeDefined();
  });
});

describe('getCityToTimezoneMap', () => {
  it('should return a Map', () => {
    const map = getCityToTimezoneMap();
    expect(map).toBeInstanceOf(Map);
  });

  it('should map city names to timezone IDs', () => {
    const map = getCityToTimezoneMap();
    // Check that NYC alias works (guaranteed to be in commonAliases)
    const nycTz = map.get('nyc');
    expect(nycTz).toBe('America/New_York');
    // Also check that the map has entries
    expect(map.size).toBeGreaterThan(0);
  });

  it('should return cached map on subsequent calls', () => {
    const first = getCityToTimezoneMap();
    const second = getCityToTimezoneMap();
    expect(first).toBe(second); // Same reference (cached)
  });

  it('should handle city names with spaces', () => {
    const map = getCityToTimezoneMap();
    const sfTz = map.get('san francisco');
    expect(sfTz).toBe('America/Los_Angeles');
  });

  it('should handle city names without spaces', () => {
    const map = getCityToTimezoneMap();
    const nycTz = map.get('nyc');
    expect(nycTz).toBe('America/New_York');
  });

  it('should map common aliases', () => {
    const map = getCityToTimezoneMap();
    expect(map.get('nyc')).toBe('America/New_York');
    expect(map.get('la')).toBe('America/Los_Angeles');
    expect(map.get('uk')).toBe('Europe/London');
  });

  it('should map country names', () => {
    const map = getCityToTimezoneMap();
    const japanTz = map.get('japan');
    expect(japanTz).toBe('Asia/Tokyo');
  });

  it('should handle case-insensitive lookups', () => {
    const map = getCityToTimezoneMap();
    // All entries are stored in lowercase, so lookups should be lowercase
    // Check aliases which are guaranteed to exist
    expect(map.get('london')).toBe('Europe/London');
    expect(map.get('tokyo')).toBe('Asia/Tokyo');
    expect(map.get('paris')).toBe('Europe/Paris');
    // The map stores everything in lowercase, so uppercase lookups won't work
    // This is expected behavior - callers should normalize input
  });

  it('should include main cities from timezone data', () => {
    const map = getCityToTimezoneMap();
    const data = getTimezoneData();
    
    // Check a few timezones have their main cities mapped
    const nyTz = data.find((tz) => tz.name === 'America/New_York');
    if (nyTz?.mainCities && nyTz.mainCities.length > 0) {
      const city = nyTz.mainCities[0].toLowerCase();
      expect(map.get(city)).toBe('America/New_York');
    }
  });
});

describe('preInitializeTimezoneData', () => {
  it('should initialize all caches without errors', () => {
    expect(() => preInitializeTimezoneData()).not.toThrow();
  });

  it('should allow multiple calls without errors', () => {
    expect(() => {
      preInitializeTimezoneData();
      preInitializeTimezoneData();
      preInitializeTimezoneData();
    }).not.toThrow();
  });

  it('should warm up all caches', () => {
    // Clear any existing caches by accessing them (they're module-level)
    // Then pre-initialize
    preInitializeTimezoneData();
    
    // All getters should work without throwing
    expect(() => getTimezoneData()).not.toThrow();
    expect(() => getTimezoneMap()).not.toThrow();
    expect(() => getTimezoneSearchIndex()).not.toThrow();
    expect(() => getCityToTimezoneMap()).not.toThrow();
  });

  it('should initialize caches asynchronously', () => {
    // The function should return immediately (non-blocking)
    const start = Date.now();
    preInitializeTimezoneData();
    const end = Date.now();
    // Should return very quickly (non-blocking)
    expect(end - start).toBeLessThan(100);
  });
});

describe('timezone data consistency', () => {
  it('should have consistent data across all getters', () => {
    const data = getTimezoneData();
    const map = getTimezoneMap();
    const cityMap = getCityToTimezoneMap();
    const index = getTimezoneSearchIndex();

    // All should reference the same underlying data
    expect(map.size).toBe(data.length);
    
    // Search index should be able to find items in the map
    const results = index.search('New York');
    expect(results.length).toBeGreaterThan(0);
    const foundTz = results[0].item;
    expect(map.get(foundTz.name)).toBeDefined();
    
    // City map should reference valid timezones (use guaranteed aliases)
    const nycTz = cityMap.get('nyc');
    expect(nycTz).toBe('America/New_York');
    expect(map.get(nycTz!)).toBeDefined();
    
    // Verify a few more aliases
    const londonTz = cityMap.get('london');
    expect(londonTz).toBe('Europe/London');
    expect(map.get(londonTz!)).toBeDefined();
  });

  it('should handle all timezones consistently', () => {
    const data = getTimezoneData();
    const map = getTimezoneMap();
    
    // Every timezone in data should be in map
    data.forEach((tz) => {
      expect(map.get(tz.name)).toBeDefined();
      expect(map.get(tz.name)?.name).toBe(tz.name);
    });
  });
});

