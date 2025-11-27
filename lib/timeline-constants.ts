/**
 * Configuration constants for timeline visualization
 * Light mode uses original colors, dark mode adds appropriate variants
 */

export const TIME_OF_DAY_CONFIG = {
  day: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-950 dark:text-amber-100",
    textMuted: "text-amber-900 dark:text-amber-200",
  },
  evening: {
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    text: "text-indigo-950 dark:text-indigo-100",
    textMuted: "text-indigo-900 dark:text-indigo-200",
  },
  night: {
    bg: "bg-slate-100 dark:bg-stone-800/60",
    text: "text-slate-950 dark:text-stone-100",
    textMuted: "text-slate-900 dark:text-stone-300",
  },
} as const;

export const NEW_DAY_CONFIG = {
  bg: "bg-violet-100 dark:bg-violet-900/40",
  text: "text-violet-950 dark:text-violet-100",
  textMuted: "text-violet-900 dark:text-violet-200",
} as const;
