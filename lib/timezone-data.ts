import { getTimeZones, type TimeZone } from "@vvo/tzdb";
import Fuse from "fuse.js";

/**
 * Shared timezone data service.
 * Provides a single source of truth for timezone data from @vvo/tzdb,
 * preventing duplicate initialization across the codebase.
 */

// Cache for raw timezone data array
let timezoneDataCache: TimeZone[] | null = null;

// Cache for timezone map (name -> TimeZone)
let timezoneMapCache: Map<string, TimeZone> | null = null;

// Cache for Fuse.js search index
let searchIndexCache: Fuse<TimeZone> | null = null;

// Cache for city/country/alias -> timezone name mapping
let cityToTimezoneMapCache: Map<string, string> | null = null;

// Track initialization promise for async initialization
let initializationPromise: Promise<void> | null = null;

/**
 * Gets all timezone data from @vvo/tzdb.
 * Initializes cache on first call, returns cached data on subsequent calls.
 */
export function getTimezoneData(): TimeZone[] {
  if (!timezoneDataCache) {
    timezoneDataCache = getTimeZones();
  }
  return timezoneDataCache;
}

/**
 * Gets a map of timezone name -> TimeZone object.
 * Useful for quick lookups by IANA timezone ID.
 */
export function getTimezoneMap(): Map<string, TimeZone> {
  if (!timezoneMapCache) {
    const data = getTimezoneData();
    timezoneMapCache = new Map(data.map((tz) => [tz.name, tz]));
  }
  return timezoneMapCache;
}

/**
 * Gets the Fuse.js search index for fuzzy timezone searching.
 * Initializes on first call with optimized search configuration.
 */
export function getTimezoneSearchIndex(): Fuse<TimeZone> {
  if (!searchIndexCache) {
    const data = getTimezoneData();
    searchIndexCache = new Fuse(data, {
      keys: [
        { name: "mainCities", weight: 2 },
        { name: "countryName", weight: 1.5 },
        { name: "alternativeName", weight: 1 },
        { name: "name", weight: 0.5 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }
  return searchIndexCache;
}

/**
 * Gets a map of city/country/alias names -> timezone IANA IDs.
 * Includes main cities, countries, alternative names, and common aliases.
 */
export function getCityToTimezoneMap(): Map<string, string> {
  if (!cityToTimezoneMapCache) {
    cityToTimezoneMapCache = new Map();
    const data = getTimezoneData();

    data.forEach((tz) => {
      // Map main cities
      tz.mainCities?.forEach((city) => {
        const normalizedCity = city.toLowerCase();
        cityToTimezoneMapCache!.set(normalizedCity, tz.name);

        // Add variations (e.g., "new york" -> "newyork")
        if (city.includes(" ")) {
          const parts = city.split(" ");
          cityToTimezoneMapCache!.set(parts.join("").toLowerCase(), tz.name);
        }
      });

      // Map country names
      if (tz.countryName) {
        const normalizedCountry = tz.countryName.toLowerCase();
        // For countries, prefer the capital or most populous city's timezone
        if (!cityToTimezoneMapCache!.has(normalizedCountry)) {
          cityToTimezoneMapCache!.set(normalizedCountry, tz.name);
        }
      }

      // Map alternative names
      if (tz.alternativeName) {
        cityToTimezoneMapCache!.set(tz.alternativeName.toLowerCase(), tz.name);
      }
    });

    // Common aliases and abbreviations
    const commonAliases: Record<string, string> = {
      nyc: "America/New_York",
      ny: "America/New_York",
      la: "America/Los_Angeles",
      sf: "America/Los_Angeles",
      "san francisco": "America/Los_Angeles",
      chicago: "America/Chicago",
      boston: "America/New_York",
      miami: "America/New_York",
      london: "Europe/London",
      uk: "Europe/London",
      britain: "Europe/London",
      paris: "Europe/Paris",
      france: "Europe/Paris",
      berlin: "Europe/Berlin",
      germany: "Europe/Berlin",
      tokyo: "Asia/Tokyo",
      japan: "Asia/Tokyo",
      beijing: "Asia/Shanghai",
      china: "Asia/Shanghai",
      shanghai: "Asia/Shanghai",
      "hong kong": "Asia/Hong_Kong",
      singapore: "Asia/Singapore",
      dubai: "Asia/Dubai",
      uae: "Asia/Dubai",
      sydney: "Australia/Sydney",
      melbourne: "Australia/Melbourne",
      australia: "Australia/Sydney",
      india: "Asia/Kolkata",
      delhi: "Asia/Kolkata",
      mumbai: "Asia/Kolkata",
      bangalore: "Asia/Kolkata",
      brazil: "America/Sao_Paulo",
      "sao paulo": "America/Sao_Paulo",
      rio: "America/Sao_Paulo",
      mexico: "America/Mexico_City",
      "mexico city": "America/Mexico_City",
      toronto: "America/Toronto",
      canada: "America/Toronto",
      vancouver: "America/Vancouver",
      moscow: "Europe/Moscow",
      russia: "Europe/Moscow",
      korea: "Asia/Seoul",
      seoul: "Asia/Seoul",
      taiwan: "Asia/Taipei",
      taipei: "Asia/Taipei",
    };

    Object.entries(commonAliases).forEach(([alias, tz]) => {
      cityToTimezoneMapCache!.set(alias, tz);
    });
  }
  return cityToTimezoneMapCache;
}

/**
 * Pre-initializes all timezone data caches in the background.
 * Call this early (e.g., in useEffect) to warm up the cache without blocking.
 */
export function preInitializeTimezoneData(): void {
  if (!timezoneDataCache && !initializationPromise) {
    initializationPromise = Promise.resolve().then(() => {
      // Initialize all caches
      getTimezoneData();
      getTimezoneMap();
      getTimezoneSearchIndex();
      getCityToTimezoneMap();
      initializationPromise = null;
    });
  }
}


