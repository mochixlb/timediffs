import {
  getTimezoneSearchIndex,
  getCityToTimezoneMap,
  preInitializeTimezoneData,
} from "./timezone-data";

// Intent types for different command patterns
export type CommandIntent =
  | { type: "add"; timezones: string[] }
  | { type: "compare"; timezones: string[] }
  | { type: "remove"; timezones: string[] }
  | { type: "clear" }
  | { type: "unknown" };

/**
 * Pre-initializes the timezone data in the background.
 * Call this early (e.g., in useEffect) to warm up the cache.
 * Re-exports from timezone-data for backward compatibility.
 */
export function preInitializeSearchIndex(): void {
  preInitializeTimezoneData();
}

// Pattern matchers for different command types
const COMMAND_PATTERNS = {
  // Add/Show patterns
  add: [
    /(?:add|show|give me|display|include|get|find|look up|search|need|want|show me|can I see)\s+(.+?)(?:\s+time\s*(?:zone)?)?$/i,
    /what(?:'s| is)(?: the)? time\s*(?:zone)? (?:in|for|at) (.+)/i,
    /what(?:'s| is) the timezone (?:of|for) (.+)/i,
    /what timezone is (.+)/i,
    /time\s*(?:zone)? (?:in|for|at) (.+)/i,
    /timezone (?:of|for) (.+)/i,
    /(.+?) time\s*(?:zone)?$/i,
    /current time (?:in|for|at) (.+)/i,
  ],

  // Compare patterns
  compare: [
    /compare\s+(.+?)\s+(?:with|and|vs\.?|versus)\s+(.+)/i,
    /(.+?)\s+vs\.?\s+(.+)/i,
    /(.+?)\s+and\s+(.+?)(?:\s+time\s*(?:zone)?s?)?$/i,
    /(?:difference|time difference) (?:between|of)\s+(.+?)\s+(?:and|with)\s+(.+)/i,
    /time difference\s+(.+?)\s+(?:and|with)\s+(.+)/i,
  ],

  // Remove patterns
  remove: [
    /(?:remove|delete|clear|hide|take away)\s+(.+?)(?:\s+time\s*(?:zone)?)?$/i,
  ],

  // Clear all
  clear: [/clear\s+all/i, /remove\s+all/i, /reset/i],
};

// Extract location from text
function extractLocations(text: string): string[] {
  const cityToTimezoneMap = getCityToTimezoneMap();
  const searchIndex = getTimezoneSearchIndex();
  const locations: string[] = [];
  const normalizedText = text.toLowerCase().trim();

  // Split by common separators (commas, and, with, vs, etc.)
  // Handle commas with optional spaces: "city1, city2" or "city1,city2"
  const parts = normalizedText
    .split(/\s*,\s*/) // Split by commas first (with optional spaces)
    .flatMap((part) => part.split(/\s+(?:and|with|vs\.?|versus)\s+/)); // Then split by other separators

  parts.forEach((part) => {
    // Clean up the part
    const cleaned = part
      .replace(/time\s*(?:zone)?s?$/i, "") // Matches "time", "timezone", "time zone", "timezones", "time zones"
      .replace(/^(?:in|at|for|of)\s+/, "") // Remove leading prepositions
      .replace(/[?!.,;:]+$/, "") // Remove trailing punctuation
      .trim();

    if (cleaned) {
      // First try exact match
      if (cityToTimezoneMap.has(cleaned)) {
        locations.push(cityToTimezoneMap.get(cleaned)!);
      } else {
        // Try fuzzy search
        const results = searchIndex.search(cleaned);
        if (results.length > 0 && results[0].score! < 0.3) {
          locations.push(results[0].item.name);
        }
      }
    }
  });

  return locations;
}

// Main parser function
export function parseCommand(input: string): CommandIntent {
  const trimmed = input.trim();
  if (!trimmed) return { type: "unknown" };

  // Check for clear command
  for (const pattern of COMMAND_PATTERNS.clear) {
    if (pattern.test(trimmed)) {
      return { type: "clear" };
    }
  }

  // Check for compare patterns
  for (const pattern of COMMAND_PATTERNS.compare) {
    const match = trimmed.match(pattern);
    if (match) {
      const locations = [];

      // Extract locations from capture groups
      for (let i = 1; i < match.length; i++) {
        if (match[i]) {
          const extracted = extractLocations(match[i]);
          locations.push(...extracted);
        }
      }

      if (locations.length >= 2) {
        return { type: "compare", timezones: locations };
      }
    }
  }

  // Check for remove patterns
  for (const pattern of COMMAND_PATTERNS.remove) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const timezones = extractLocations(match[1]);
      if (timezones.length > 0) {
        return { type: "remove", timezones };
      }
    }
  }

  // Check for add patterns
  for (const pattern of COMMAND_PATTERNS.add) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const timezones = extractLocations(match[1]);
      if (timezones.length > 0) {
        return { type: "add", timezones };
      }
    }
  }

  // Fallback: try to extract locations from the whole string
  const locations = extractLocations(trimmed);
  if (locations.length > 0) {
    return { type: "add", timezones: locations };
  }

  return { type: "unknown" };
}

// Get suggestions based on partial input
export function getSuggestions(
  input: string,
  limit: number = 5
): Array<{
  name: string;
  timezone: string;
  type: "city" | "country" | "timezone";
}> {
  if (!input || input.length < 2) return [];

  const searchIndex = getTimezoneSearchIndex();
  const normalizedInput = input.toLowerCase().trim();
  const suggestions: Array<{
    name: string;
    timezone: string;
    type: "city" | "country" | "timezone";
    score: number;
  }> = [];

  // Search through the index
  const results = searchIndex.search(normalizedInput, { limit: limit * 2 });

  results.forEach((result) => {
    const tz = result.item;

    // Add main cities
    tz.mainCities?.forEach((city) => {
      if (city.toLowerCase().includes(normalizedInput)) {
        suggestions.push({
          name: city,
          timezone: tz.name,
          type: "city",
          score: result.score || 1,
        });
      }
    });

    // Add country if it matches
    if (tz.countryName?.toLowerCase().includes(normalizedInput)) {
      suggestions.push({
        name: tz.countryName,
        timezone: tz.name,
        type: "country",
        score: result.score || 1,
      });
    }
  });

  // Sort by score and deduplicate
  const seen = new Set<string>();
  return suggestions
    .sort((a, b) => a.score - b.score)
    .filter((s) => {
      const key = `${s.name}-${s.timezone}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(({ score, ...rest }) => rest);
}
