/**
 * Configuration constants for timeline visualization
 */

export const TIME_OF_DAY_CONFIG = {
  day: {
    bg: "bg-amber-100",
    text: "text-amber-900",
    textMuted: "text-amber-700",
  },
  evening: {
    bg: "bg-indigo-100",
    text: "text-indigo-900",
    textMuted: "text-indigo-700",
  },
  night: {
    bg: "bg-slate-100",
    text: "text-slate-900",
    textMuted: "text-slate-700",
  },
} as const;

export const NEW_DAY_CONFIG = {
  bg: "bg-violet-100",
  text: "text-violet-900",
  textMuted: "text-violet-700",
} as const;
