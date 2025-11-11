"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Timezone, TimezoneDisplay } from "@/types";
import { createTimezoneDisplay, getTimezoneById } from "@/lib/timezone";

interface TimezoneContextType {
  timezoneDisplays: TimezoneDisplay[];
  removeTimezone: (timezoneId: string) => void;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

const DEFAULT_TIMEZONES = [
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
];

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezones, setTimezones] = useState<Timezone[]>(() => {
    return DEFAULT_TIMEZONES
      .map((id) => getTimezoneById(id))
      .filter((tz): tz is Timezone => tz !== undefined);
  });
  const [selectedDate] = useState<Date>(new Date());
  const [timezoneDisplays, setTimezoneDisplays] = useState<TimezoneDisplay[]>([]);

  const updateDisplays = useCallback(() => {
    const displays = timezones.map((tz) => createTimezoneDisplay(tz, selectedDate));
    setTimezoneDisplays(displays);
  }, [timezones, selectedDate]);

  useEffect(() => {
    updateDisplays();
  }, [updateDisplays]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateDisplays();
    }, 60000);

    return () => clearInterval(interval);
  }, [updateDisplays]);

  const removeTimezone = useCallback((timezoneId: string) => {
    setTimezones((prev) => prev.filter((tz) => tz.id !== timezoneId));
  }, []);

  return (
    <TimezoneContext.Provider
      value={{
        timezoneDisplays,
        removeTimezone,
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

