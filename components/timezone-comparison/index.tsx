"use client";

import { useState, useEffect } from "react";
import { Edit2, Check } from "lucide-react";
import { TimelineVisualization } from "./timeline-visualization";
import { TimezonePicker } from "./timezone-picker";
import { DatePicker } from "./date-picker";
import { WeekView } from "./week-view";
import { TimeFormatToggle } from "./time-format-toggle";
import { CopyLinkButton } from "./share-button";
import { useTimezone } from "@/contexts/timezone-context";
import { LogoIcon } from "@/components/logo-icon";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { Footer } from "@/components/footer";
import { parseTimezoneId } from "@/lib/timezone";
import { cn } from "@/lib/utils";

export function TimezoneComparison() {
  const {
    timezoneDisplays,
    removeTimezone,
    detectedTimezone,
    clearDetectedTimezone,
  } = useTimezone();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (detectedTimezone) {
      setShowToast(true);
      // Clear detected timezone after showing toast to prevent re-showing
      const timer = setTimeout(() => {
        setShowToast(false);
        clearDetectedTimezone();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [detectedTimezone, clearDetectedTimezone]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-[1920px] mx-auto px-3 py-4 lg:px-6 lg:py-8 xl:px-8 flex-1">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          {/* Mobile Layout: Stacked (< 1024px) */}
          <div className="flex flex-col lg:hidden gap-4">
            {/* Logo/Title - Responsive scaling */}
            <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
              <LogoIcon className="h-5 w-5 sm:h-[22px] sm:w-[22px] md:h-6 md:w-6 text-foreground shrink-0 transition-all duration-200" />
              <h1 className="text-lg sm:text-xl md:text-xl font-medium tracking-tight text-foreground transition-all duration-200">
                timediffs.app
              </h1>
            </div>

            {/* Controls - Two-row layout for better mobile UX */}
            <div className="flex flex-col gap-2">
              {/* Primary Actions Row: Add and Date */}
              <div className="flex flex-row items-center gap-2">
                <div className="flex-1 min-w-0">
                  <TimezonePicker />
                </div>
                <div className="flex-1 min-w-0">
                  <DatePicker />
                </div>
              </div>
              
              {/* Secondary Actions Row: Time format, Share, Edit */}
              <div className="flex flex-row items-center gap-2">
                <TimeFormatToggle />
                <CopyLinkButton />
                {/* Edit Mode Toggle - Icon-only on mobile */}
                {timezoneDisplays.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                      "h-11 w-11 p-0 border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                      isEditMode && "bg-slate-100"
                    )}
                    aria-label={isEditMode ? "Exit edit mode" : "Enter edit mode"}
                    title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
                  >
                    {isEditMode ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* iPad Pro Layout: Same Row (1024px - 1279px) */}
          <div className="hidden lg:flex lg:items-center lg:justify-between xl:hidden gap-4">
            {/* Logo/Title - Left Aligned */}
            <div className="flex items-center gap-3">
              <LogoIcon className="h-6 w-6 text-foreground shrink-0" />
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                timediffs.app
              </h1>
            </div>

            {/* Controls - Right Aligned */}
            <div className="flex flex-row items-center gap-4 flex-wrap">
              <TimezonePicker />
              <DatePicker />
              <WeekView />
              <TimeFormatToggle />
              <CopyLinkButton />
            </div>
          </div>

          {/* Desktop Layout: Same Row (>= 1280px) */}
          <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-4">
            {/* Logo/Title - Left Aligned */}
            <div className="flex items-center gap-3">
              <LogoIcon className="h-6 w-6 text-foreground shrink-0" />
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                timediffs.app
              </h1>
            </div>

            {/* Controls - Right Aligned */}
            <div className="flex flex-row items-center gap-4 flex-wrap">
              <TimezonePicker />
              <DatePicker />
              <WeekView />
              <TimeFormatToggle />
              <CopyLinkButton />
            </div>
          </div>
        </header>
        <main>
          {timezoneDisplays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm lg:text-base">
                No timezones added yet. Add one to get started.
              </p>
            </div>
          ) : (
            <TimelineVisualization
              onRemoveTimezone={removeTimezone}
              isEditMode={isEditMode}
            />
          )}
        </main>
      </div>
      <Footer />
      {showToast && detectedTimezone && (
        <Toast
          message={`Detected your timezone: ${
            parseTimezoneId(detectedTimezone).displayName
          }`}
          onClose={() => {
            setShowToast(false);
            clearDetectedTimezone();
          }}
        />
      )}
    </div>
  );
}
