"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TimezoneComparison } from "@/components/timezone-comparison";
import { CalendarClock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Client wrapper for the home page with error boundary.
 * Catches errors in the TimezoneComparison component.
 */
export default function Home() {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-stone-800">
              <CalendarClock className="h-6 w-6 text-slate-500 dark:text-stone-400" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Unable to display timeline
              </h2>
              <p className="text-sm text-muted-foreground">
                We're having trouble loading the timezone comparison. Please
                refresh the page to try again.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh page
            </Button>
          </div>
        </div>
      }
    >
      <TimezoneComparison />
    </ErrorBoundary>
  );
}
