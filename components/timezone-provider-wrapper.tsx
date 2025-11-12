"use client";

import { TimezoneProvider } from "@/contexts/timezone-context";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimezoneProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps TimezoneProvider with an error boundary to catch context-related errors.
 * Provides a specific error message for timezone initialization failures.
 */
export function TimezoneProviderWrapper({
  children,
}: TimezoneProviderWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto px-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-50">
              <Clock className="h-6 w-6 text-slate-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Unable to load timezones
              </h2>
              <p className="text-sm text-muted-foreground">
                We're having trouble initializing the timezone data. Please
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
      <TimezoneProvider>{children}</TimezoneProvider>
    </ErrorBoundary>
  );
}

