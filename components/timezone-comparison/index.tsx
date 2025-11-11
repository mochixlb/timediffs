"use client";

import { useState } from "react";
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
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

export function TimezoneComparison() {
  const { timezoneDisplays, removeTimezone } = useTimezone();
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-[1920px] mx-auto px-3 py-4 lg:px-6 lg:py-8 xl:px-8 flex-1">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          {/* Mobile Layout: Stacked (< 1024px) */}
          <div className="flex flex-col lg:hidden gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <LogoIcon className="h-5 w-5 text-foreground shrink-0" />
              <h1 className="text-xl font-medium tracking-tight text-foreground">
                timediffs.app
              </h1>
            </div>

            {/* Controls */}
            <div className="flex flex-row items-center gap-2 flex-wrap">
              <TimezonePicker />
              <DatePicker />
              <TimeFormatToggle />
              <CopyLinkButton />
              {/* Edit Mode Toggle - Mobile Only */}
              {timezoneDisplays.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={cn(
                    "h-11 min-w-[90px] gap-1.5 border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 px-2.5",
                    isEditMode && "bg-slate-100"
                  )}
                  aria-label={isEditMode ? "Exit edit mode" : "Enter edit mode"}
                  title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
                >
                  {isEditMode ? (
                    <>
                      <Check className="h-4 w-4 shrink-0" />
                      <span className="text-xs">Done</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 shrink-0" />
                      <span className="text-xs">Edit</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* iPad Pro Layout: Header alone, buttons second row (1024px - 1279px) */}
          <div className="hidden lg:flex lg:flex-col xl:hidden gap-4">
            {/* Logo/Title - Alone on top */}
            <div className="flex items-center gap-3">
              <LogoIcon className="h-6 w-6 text-foreground shrink-0" />
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                timediffs.app
              </h1>
            </div>

            {/* Controls - Second row */}
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
    </div>
  );
}
