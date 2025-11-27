"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Theme toggle button with animated sun/moon icons.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className={cn(
        "h-9 w-9 lg:h-9 lg:w-9 p-0 rounded-lg lg:rounded-md",
        "text-slate-600 dark:text-stone-400",
        "hover:text-slate-900 dark:hover:text-stone-200",
        "hover:bg-slate-100 dark:hover:bg-stone-800",
        "lg:border lg:border-slate-300 dark:lg:border-stone-700",
        "lg:bg-white dark:lg:bg-stone-900",
        "shrink-0 transition-all duration-200"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative h-4 w-4">
        <Sun
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-300",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-300",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </div>
    </Button>
  );
}
