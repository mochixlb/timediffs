/**
 * Configuration constants for timeline visualization
 */

export const TIME_OF_DAY_CONFIG = {
  day: {
    bg: "bg-amber-100",
    text: "text-amber-950",
    textMuted: "text-amber-900",
  },
  evening: {
    bg: "bg-indigo-100",
    text: "text-indigo-950",
    textMuted: "text-indigo-900",
  },
  night: {
    bg: "bg-slate-100",
    text: "text-slate-950",
    textMuted: "text-slate-900",
  },
} as const;

export const NEW_DAY_CONFIG = {
  bg: "bg-violet-100",
  text: "text-violet-950",
  textMuted: "text-violet-900",
} as const;
