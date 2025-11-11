"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { Timezone, TimezoneDisplay } from "@/types";
import { createTimezoneDisplay, createTimezoneFromId } from "@/lib/timezone";
import { arrayMove } from "@dnd-kit/sortable";

interface TimezoneContextType {
  timezoneDisplays: TimezoneDisplay[];
  addTimezone: (timezoneId: string) => void;
  removeTimezone: (timezoneId: string) => void;
  setHomeTimezone: (timezoneId: string) => void;
  reorderTimezones: (newOrderIds: string[]) => void;
  moveTimezone: (timezoneId: string, direction: "up" | "down") => void;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(
  undefined
);

const DEFAULT_TIMEZONES = [
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
];

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezones, setTimezones] = useState<Timezone[]>(() => {
    const initial = DEFAULT_TIMEZONES.map((id) => createTimezoneFromId(id));
    // Set first timezone as home by default
    if (initial.length > 0) {
      initial[0].isHome = true;
    }
    return initial;
  });
  const [timezoneDisplays, setTimezoneDisplays] = useState<TimezoneDisplay[]>(
    []
  );

  const updateDisplays = useCallback(() => {
    const currentDate = new Date();
    const displays = timezones.map((tz) =>
      createTimezoneDisplay(tz, currentDate)
    );
    setTimezoneDisplays(displays);
  }, [timezones]);

  useEffect(() => {
    updateDisplays();
  }, [updateDisplays]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateDisplays();
    }, 60000);

    return () => clearInterval(interval);
  }, [updateDisplays]);

  const addTimezone = useCallback((timezoneId: string) => {
    setTimezones((prev) => {
      // Check if timezone already exists
      if (prev.some((tz) => tz.id === timezoneId)) {
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

  const moveTimezone = useCallback(
    (timezoneId: string, direction: "up" | "down") => {
      setTimezones((prev) => {
        const index = prev.findIndex((tz) => tz.id === timezoneId);
        if (index === -1) return prev;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;
        return arrayMove(prev, index, targetIndex);
      });
    },
    []
  );

  return (
    <TimezoneContext.Provider
      value={{
        timezoneDisplays,
        addTimezone,
        removeTimezone,
        setHomeTimezone,
        reorderTimezones,
        moveTimezone,
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
