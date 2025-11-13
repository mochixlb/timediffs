"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useQueryStates } from "nuqs";
import type { Timezone, TimezoneDisplay } from "@/types";
import {
  createTimezoneDisplay,
  createTimezoneFromId,
  getAllTimezoneIds,
} from "@/lib/timezone";
import {
  parseAsTimezoneArray,
  parseAsDate,
  parseAsTimeFormat,
  parseAsHomeTimezone,
  MAX_TIMEZONES,
} from "@/lib/url-parsers";

export type TimeFormat = "12h" | "24h";

interface TimezoneContextType {
  timezoneDisplays: TimezoneDisplay[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  addTimezone: (timezoneId: string) => void;
  removeTimezone: (timezoneId: string) => void;
  setHomeTimezone: (timezoneId: string) => void;
  reorderTimezones: (newOrderIds: string[]) => void;
  detectedTimezone: string | null;
  clearDetectedTimezone: () => void;
  currentTime: Date;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(
  undefined
);

// Backup default timezones (used if browser timezone detection fails)
const BACKUP_TIMEZONES = ["America/New_York", "Europe/London", "Asia/Tokyo"];

// Additional timezones to show alongside browser timezone (2 total)
const ADDITIONAL_TIMEZONES = ["America/New_York", "Europe/London"];

/**
 * Validates that a timezone ID exists in the available timezones.
 */
function isValidTimezoneId(id: string): boolean {
  try {
    const allIds = getAllTimezoneIds();
    return allIds.includes(id);
  } catch {
    return false;
  }
}

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  // Sync URL state with nuqs hooks
  const [urlState, setUrlState] = useQueryStates({
    tz: parseAsTimezoneArray,
    date: parseAsDate.withDefault(new Date()),
    format: parseAsTimeFormat,
    home: parseAsHomeTimezone,
  });

  // Track if we've initialized from URL to prevent overwriting user changes
  const initializedFromUrlRef = useRef(false);
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);

  // Detect browser timezone
  const getBrowserTimezone = useCallback((): string | null => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return isValidTimezoneId(tz) ? tz : null;
    } catch {
      return null;
    }
  }, []);

  // Initialize timezones from URL or defaults
  const [timezones, setTimezones] = useState<Timezone[]>([]);

  // Initialize from URL on mount (only once)
  useEffect(() => {
    if (initializedFromUrlRef.current) return;

    // If URL has timezones, use them (validate first)
    if (urlState.tz && urlState.tz.length > 0) {
      const validIds = urlState.tz.filter(isValidTimezoneId);
      if (validIds.length > 0) {
        const initial = validIds.map((id) => createTimezoneFromId(id));
        // Set home timezone if specified in URL
        if (urlState.home && validIds.includes(urlState.home)) {
          initial.forEach((tz) => {
            tz.isHome = tz.id === urlState.home;
          });
        } else if (initial.length > 0) {
          initial[0].isHome = true;
        }
        setTimezones(initial);
        initializedFromUrlRef.current = true;
        return;
      }
    }

    // No URL timezones - set up defaults (browser timezone + 2 others, or 3 backups)
    const browserTz = getBrowserTimezone();
    let defaultIds: string[];

    if (browserTz) {
      // Browser timezone detected: use it + 2 additional timezones (filter out duplicates)
      defaultIds = [
        browserTz,
        ...ADDITIONAL_TIMEZONES.filter((tz) => tz !== browserTz).slice(0, 2),
      ];
      setDetectedTimezone(browserTz);
    } else {
      // Browser timezone not detected: use 3 backup timezones
      defaultIds = BACKUP_TIMEZONES;
    }

    const initial = defaultIds.map((id) => createTimezoneFromId(id));
    initial[0].isHome = true;
    setTimezones(initial);

    // Mark as initialized
    initializedFromUrlRef.current = true;
  }, [urlState.tz, urlState.home, getBrowserTimezone]);

  // Use date from URL or default to today
  // When viewing today, we need to update the time in real-time
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Update current time every second for smooth real-time indicator movement
  useEffect(() => {
    // Update immediately on mount
    setCurrentTime(new Date());

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for smooth real-time movement

    return () => clearInterval(interval);
  }, []);

  const selectedDate = useMemo(() => {
    if (urlState.date) {
      // If a date is selected from URL, use it (it will be at midnight from parser)
      // But if it's today, use the current time instead
      const today = new Date();
      const isToday =
        urlState.date.getFullYear() === today.getFullYear() &&
        urlState.date.getMonth() === today.getMonth() &&
        urlState.date.getDate() === today.getDate();

      if (isToday) {
        return currentTime;
      }
      return urlState.date;
    }
    // No date selected, use current time (updates in real-time)
    return currentTime;
  }, [urlState.date, currentTime]);

  // Use format from URL or default to 12h
  const timeFormat = useMemo(() => {
    return urlState.format || "12h";
  }, [urlState.format]);

  const [timezoneDisplays, setTimezoneDisplays] = useState<TimezoneDisplay[]>(
    []
  );

  // Sync timezones to URL when they change (but not during initial URL load)
  useEffect(() => {
    // Don't sync if we haven't initialized from URL yet
    if (!initializedFromUrlRef.current) return;

    const timezoneIds = timezones.map((tz) => tz.id);
    const homeId = timezones.find((tz) => tz.isHome)?.id || null;

    // Only update URL if different from current state
    const tzChanged =
      JSON.stringify(timezoneIds) !== JSON.stringify(urlState.tz);
    const homeChanged = homeId !== urlState.home;

    if (tzChanged || homeChanged) {
      setUrlState({
        tz: timezoneIds,
        home: homeId,
      });
    }
  }, [timezones, urlState.tz, urlState.home, setUrlState]);

  const updateDisplays = useCallback(() => {
    const displays = timezones.map((tz) =>
      createTimezoneDisplay(tz, selectedDate, timeFormat)
    );
    setTimezoneDisplays(displays);
  }, [timezones, selectedDate, timeFormat]);

  useEffect(() => {
    updateDisplays();
  }, [updateDisplays]);

  const addTimezone = useCallback((timezoneId: string) => {
    // Validate timezone ID
    if (!isValidTimezoneId(timezoneId)) {
      console.warn(`Invalid timezone ID: ${timezoneId}`);
      return;
    }

    setTimezones((prev) => {
      // Check if timezone already exists
      if (prev.some((tz) => tz.id === timezoneId)) {
        return prev;
      }

      // Enforce maximum limit to prevent DoS and performance issues
      if (prev.length >= MAX_TIMEZONES) {
        console.warn(
          `Maximum timezone limit (${MAX_TIMEZONES}) reached. Cannot add more timezones.`
        );
        return prev;
      }

      const newTimezone = createTimezoneFromId(timezoneId);
      return [...prev, newTimezone];
    });
  }, []);

  const removeTimezone = useCallback((timezoneId: string) => {
    setTimezones((prev) => {
      const filtered = prev.filter((tz) => tz.id !== timezoneId);
      // If removed timezone was home, set first remaining as home
      const wasHome = prev.find((tz) => tz.id === timezoneId)?.isHome;
      if (wasHome && filtered.length > 0) {
        filtered[0].isHome = true;
      }
      return filtered;
    });
  }, []);

  const setHomeTimezone = useCallback((timezoneId: string) => {
    setTimezones((prev) =>
      prev.map((tz) => ({
        ...tz,
        isHome: tz.id === timezoneId,
      }))
    );
  }, []);

  const reorderTimezones = useCallback((newOrderIds: string[]) => {
    setTimezones((prev) => {
      if (newOrderIds.length !== prev.length) return prev;
      const idToTz = new Map(prev.map((tz) => [tz.id, tz]));
      const next: Timezone[] = [];
      for (const id of newOrderIds) {
        const tz = idToTz.get(id);
        if (!tz) return prev;
        next.push(tz);
      }
      return next;
    });
  }, []);

  const handleSetSelectedDate = useCallback(
    (date: Date) => {
      // Update URL state, which will trigger selectedDate update
      setUrlState({ date });
    },
    [setUrlState]
  );

  const handleSetTimeFormat = useCallback(
    (format: TimeFormat) => {
      // Update URL state, which will trigger timeFormat update
      setUrlState({ format });
    },
    [setUrlState]
  );

  const clearDetectedTimezone = useCallback(() => {
    setDetectedTimezone(null);
  }, []);

  return (
    <TimezoneContext.Provider
      value={{
        timezoneDisplays,
        selectedDate,
        setSelectedDate: handleSetSelectedDate,
        timeFormat,
        setTimeFormat: handleSetTimeFormat,
        addTimezone,
        removeTimezone,
        setHomeTimezone,
        reorderTimezones,
        detectedTimezone,
        clearDetectedTimezone,
        currentTime,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }
  return context;
}
