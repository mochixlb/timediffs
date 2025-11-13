import Fuse from 'fuse.js';
import { getTimeZones } from '@vvo/tzdb';
import type { TimeZone } from '@vvo/tzdb';

// Intent types for different command patterns
export type CommandIntent = 
  | { type: 'add'; timezones: string[] }
  | { type: 'compare'; timezones: string[] }
  | { type: 'remove'; timezones: string[] }
  | { type: 'clear' }
  | { type: 'unknown' };

// Build timezone search index
let timezoneSearchIndex: Fuse<TimeZone> | null = null;
let cityToTimezoneMap: Map<string, string> | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Initializes the search index asynchronously.
 * Returns immediately if already initialized, otherwise returns a promise.
 * This prevents blocking the UI thread during initialization.
 */
function initializeSearchIndex(): Fuse<TimeZone> | null {
  // If already initialized, return immediately
  if (timezoneSearchIndex) return timezoneSearchIndex;
  
  // If initialization is in progress, return null (caller should handle)
  if (initializationPromise) return null;
  
  // Start initialization
  initializationPromise = Promise.resolve().then(() => {
    _initializeSearchIndexSync();
    initializationPromise = null;
  });
  
  // For first call, initialize synchronously to avoid delay
  // Subsequent calls will use the cached version
  _initializeSearchIndexSync();
  
  return timezoneSearchIndex;
}

function _initializeSearchIndexSync() {
  if (timezoneSearchIndex) return;
  
  const timezones = getTimeZones();
  
  // Build city to timezone mapping
  cityToTimezoneMap = new Map();
  
  timezones.forEach(tz => {
    // Map main cities
    tz.mainCities?.forEach(city => {
      const normalizedCity = city.toLowerCase();
      cityToTimezoneMap!.set(normalizedCity, tz.name);
      
      // Add variations (e.g., "new york" -> "new york city")
      if (city.includes(' ')) {
        const parts = city.split(' ');
        cityToTimezoneMap!.set(parts.join('').toLowerCase(), tz.name);
      }
    });
    
    // Map country names
    if (tz.countryName) {
      const normalizedCountry = tz.countryName.toLowerCase();
      // For countries, prefer the capital or most populous city's timezone
      if (!cityToTimezoneMap!.has(normalizedCountry)) {
        cityToTimezoneMap!.set(normalizedCountry, tz.name);
      }
    }
    
    // Map alternative names
    if (tz.alternativeName) {
      cityToTimezoneMap!.set(tz.alternativeName.toLowerCase(), tz.name);
    }
  });
  
  // Common aliases and abbreviations
  const commonAliases: Record<string, string> = {
    'nyc': 'America/New_York',
    'ny': 'America/New_York',
    'la': 'America/Los_Angeles',
    'sf': 'America/Los_Angeles',
    'san francisco': 'America/Los_Angeles',
    'chicago': 'America/Chicago',
    'boston': 'America/New_York',
    'miami': 'America/New_York',
    'london': 'Europe/London',
    'uk': 'Europe/London',
    'britain': 'Europe/London',
    'paris': 'Europe/Paris',
    'france': 'Europe/Paris',
    'berlin': 'Europe/Berlin',
    'germany': 'Europe/Berlin',
    'tokyo': 'Asia/Tokyo',
    'japan': 'Asia/Tokyo',
    'beijing': 'Asia/Shanghai',
    'china': 'Asia/Shanghai',
    'shanghai': 'Asia/Shanghai',
    'hong kong': 'Asia/Hong_Kong',
    'singapore': 'Asia/Singapore',
    'dubai': 'Asia/Dubai',
    'uae': 'Asia/Dubai',
    'sydney': 'Australia/Sydney',
    'melbourne': 'Australia/Melbourne',
    'australia': 'Australia/Sydney',
    'india': 'Asia/Kolkata',
    'delhi': 'Asia/Kolkata',
    'mumbai': 'Asia/Kolkata',
    'bangalore': 'Asia/Kolkata',
    'brazil': 'America/Sao_Paulo',
    'sao paulo': 'America/Sao_Paulo',
    'rio': 'America/Sao_Paulo',
    'mexico': 'America/Mexico_City',
    'mexico city': 'America/Mexico_City',
    'toronto': 'America/Toronto',
    'canada': 'America/Toronto',
    'vancouver': 'America/Vancouver',
    'moscow': 'Europe/Moscow',
    'russia': 'Europe/Moscow',
    'korea': 'Asia/Seoul',
    'seoul': 'Asia/Seoul',
    'taiwan': 'Asia/Taipei',
    'taipei': 'Asia/Taipei',
  };
  
  Object.entries(commonAliases).forEach(([alias, tz]) => {
    cityToTimezoneMap!.set(alias, tz);
  });
  
  // Create Fuse search index
  timezoneSearchIndex = new Fuse(timezones, {
    keys: [
      { name: 'mainCities', weight: 2 },
      { name: 'countryName', weight: 1.5 },
      { name: 'alternativeName', weight: 1 },
      { name: 'name', weight: 0.5 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  });
  
  return timezoneSearchIndex;
}

/**
 * Pre-initializes the search index in the background.
 * Call this early (e.g., in useEffect) to warm up the cache.
 */
export function preInitializeSearchIndex(): void {
  if (!timezoneSearchIndex && !initializationPromise) {
    // Initialize asynchronously without blocking
    initializationPromise = Promise.resolve().then(() => {
      _initializeSearchIndexSync();
      initializationPromise = null;
    });
  }
}

// Pattern matchers for different command types
const COMMAND_PATTERNS = {
  // Add/Show patterns
  add: [
    /(?:add|show|give me|display|include)\s+(.+?)(?:\s+time(?:zone)?)?$/i,
    /what(?:'s| is)(?: the)? time in (.+)/i,
    /(.+?) time(?:zone)?$/i,
  ],
  
  // Compare patterns
  compare: [
    /compare\s+(.+?)\s+(?:with|and|vs\.?|versus)\s+(.+)/i,
    /(.+?)\s+vs\.?\s+(.+)/i,
    /(.+?)\s+and\s+(.+?)(?:\s+time(?:zone)?s?)?$/i,
    /difference between\s+(.+?)\s+and\s+(.+)/i,
  ],
  
  // Remove patterns
  remove: [
    /(?:remove|delete|clear)\s+(.+?)(?:\s+time(?:zone)?)?$/i,
  ],
  
  // Clear all
  clear: [
    /clear\s+all/i,
    /remove\s+all/i,
    /reset/i,
  ],
};

// Extract location from text
function extractLocations(text: string): string[] {
  initializeSearchIndex();
  const locations: string[] = [];
  const normalizedText = text.toLowerCase().trim();
  
  // Split by common separators
  const parts = normalizedText.split(/\s+(?:and|with|vs\.?|versus|,)\s+/);
  
  parts.forEach(part => {
    // Clean up the part
    const cleaned = part
      .replace(/time(?:zone)?s?$/i, '')
      .replace(/^(?:in|at|for)\s+/, '')
      .trim();
    
    if (cleaned) {
      // First try exact match
      if (cityToTimezoneMap?.has(cleaned)) {
        locations.push(cityToTimezoneMap.get(cleaned)!);
      } else {
        // Try fuzzy search
        const results = timezoneSearchIndex!.search(cleaned);
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
  if (!trimmed) return { type: 'unknown' };
  
  // Check for clear command
  for (const pattern of COMMAND_PATTERNS.clear) {
    if (pattern.test(trimmed)) {
      return { type: 'clear' };
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
        return { type: 'compare', timezones: locations };
      }
    }
  }
  
  // Check for remove patterns
  for (const pattern of COMMAND_PATTERNS.remove) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const timezones = extractLocations(match[1]);
      if (timezones.length > 0) {
        return { type: 'remove', timezones };
      }
    }
  }
  
  // Check for add patterns (default)
  const locations = extractLocations(trimmed);
  if (locations.length > 0) {
    return { type: 'add', timezones: locations };
  }
  
  return { type: 'unknown' };
}

// Get suggestions based on partial input
export function getSuggestions(input: string, limit: number = 5): Array<{
  name: string;
  timezone: string;
  type: 'city' | 'country' | 'timezone';
}> {
  initializeSearchIndex();
  if (!input || input.length < 2) return [];
  
  const normalizedInput = input.toLowerCase().trim();
  const suggestions: Array<{
    name: string;
    timezone: string;
    type: 'city' | 'country' | 'timezone';
    score: number;
  }> = [];
  
  // Search through the index
  const results = timezoneSearchIndex!.search(normalizedInput, { limit: limit * 2 });
  
  results.forEach(result => {
    const tz = result.item;
    
    // Add main cities
    tz.mainCities?.forEach(city => {
      if (city.toLowerCase().includes(normalizedInput)) {
        suggestions.push({
          name: city,
          timezone: tz.name,
          type: 'city',
          score: result.score || 1,
        });
      }
    });
    
    // Add country if it matches
    if (tz.countryName?.toLowerCase().includes(normalizedInput)) {
      suggestions.push({
        name: tz.countryName,
        timezone: tz.name,
        type: 'country',
        score: result.score || 1,
      });
    }
  });
  
  // Sort by score and deduplicate
  const seen = new Set<string>();
  return suggestions
    .sort((a, b) => a.score - b.score)
    .filter(s => {
      const key = `${s.name}-${s.timezone}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(({ score, ...rest }) => rest);
}
