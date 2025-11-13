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
import { CommandInput } from "@/components/command-input";
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
    <div className="bg-background flex flex-col min-h-screen lg:min-h-0">
      <div className="w-full max-w-[1920px] mx-auto px-3 py-4 lg:px-6 lg:py-8 xl:px-8 flex-1 pb-32 lg:pb-48">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          {/* Mobile Layout: Top Controls (< 1024px) */}
          <div className="flex flex-col lg:hidden gap-5">
            {/* Logo/Title - Enhanced mobile styling */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <LogoIcon className="h-7 w-7 sm:h-8 sm:w-8 text-foreground shrink-0 transition-all duration-200" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground transition-all duration-200">
                timediffs.app
              </h1>
            </div>

            {/* Top Controls: Date, Time Format, Share */}
            <div className="flex flex-row items-center gap-2">
              <div className="flex-1 min-w-0">
                <DatePicker />
              </div>
              <TimeFormatToggle />
              <CopyLinkButton />
            </div>
          </div>

          {/* Tablet Layout: Two Rows (1024px - 1279px) */}
          <div className="hidden lg:block xl:hidden">
            {/* Logo/Title Row */}
            <div className="flex items-center gap-3 mb-4">
              <LogoIcon className="h-6 w-6 text-foreground shrink-0" />
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                timediffs.app
              </h1>
            </div>

            {/* Controls Row - No wrapping */}
            <div className="flex flex-row items-center gap-2.5 flex-nowrap">
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
            <div className="flex items-center gap-3 shrink-0">
              <LogoIcon className="h-6 w-6 text-foreground shrink-0" />
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                timediffs.app
              </h1>
            </div>

            {/* Controls - Right Aligned - No wrapping */}
            <div className="flex flex-row items-center gap-2.5 flex-nowrap">
              <TimezonePicker />
              <DatePicker />
              <WeekView />
              <TimeFormatToggle />
              <CopyLinkButton />
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-300px)] lg:min-h-0">
          {timezoneDisplays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 lg:py-20 text-center">
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
        </div>
        
        {/* Spacer for fixed bottom bars (command input + footer) */}
        <div className="hidden lg:block h-48" aria-hidden="true" />
      </div>
      
      {/* Fixed Command Input Bar - Desktop Only */}
      <div className="hidden lg:block fixed bottom-28 left-0 right-0 z-40">
        <div className="w-full max-w-[1920px] mx-auto px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <CommandInput />
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Action Bar - Primary Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
        <div className="w-full max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex flex-row items-center gap-3">
            <div className="flex-1 min-w-0">
              <TimezonePicker />
            </div>
            {timezoneDisplays.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsEditMode(!isEditMode)}
                className={cn(
                  "h-12 w-12 p-0 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shrink-0 touch-manipulation",
                  isEditMode && "bg-slate-100"
                )}
                aria-label={isEditMode ? "Exit edit mode" : "Enter edit mode"}
                title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
              >
                {isEditMode ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Edit2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
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
