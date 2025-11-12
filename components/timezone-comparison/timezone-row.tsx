"use client";

import { useRef } from "react";
import { X, Home, GripVertical, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimezoneDisplay } from "@/types";
import { HourCell } from "./hour-cell";
import { useScrollFollow } from "@/hooks/use-scroll-follow";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useIsIOS } from "@/hooks/use-is-ios";

interface TimezoneRowProps {
  display: TimezoneDisplay;
  referenceHours: Date[];
  onRemove: (timezoneId: string) => void;
  onSetHome: (timezoneId: string) => void;
  dragHandleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isEditMode?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Renders a single timezone row with controls and timeline visualization.
 */
export function TimezoneRow({
  display,
  referenceHours,
  onRemove,
  onSetHome,
  dragHandleProps,
  isDragging = false,
  isEditMode = false,
  isFirst = false,
  isLast = false,
  scrollContainerRef,
}: TimezoneRowProps) {
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();
  const infoRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollFollow = isMobile && !isDragging && !isIOS;
  useScrollFollow(scrollContainerRef || { current: null }, infoRef, shouldScrollFollow);
  return (
    <div>
      <div
        className={cn(
          "group relative flex flex-col lg:flex-row items-stretch overflow-visible lg:min-h-[38px] lg:pt-0.5 lg:rounded-md gap-2",
          isDragging && "bg-white shadow-lg shadow-slate-900/10"
        )}
      >
        {/* Control Buttons Group */}
        <div
          className={cn(
            "hidden lg:flex items-center gap-2 lg:gap-1 shrink-0 mb-2 mr-0 lg:mb-0 lg:mr-3"
          )}
        >
          {/* Drag Handle */}
          <button
            className={cn(
              "flex items-center justify-center h-11 w-11 lg:h-7 lg:w-7 rounded-md text-slate-400 transition-colors hover:text-slate-600 hover:bg-slate-50 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            )}
            aria-label={`Reorder ${display.timezone.city}`}
            {...dragHandleProps}
          >
            <GripVertical className="h-5 w-5 lg:h-3.5 lg:w-3.5" />
          </button>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(display.timezone.id)}
            className="flex items-center justify-center h-11 w-11 lg:h-7 lg:w-7 rounded-md text-slate-500 transition-colors hover:text-red-600 hover:bg-red-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label={`Remove ${display.timezone.city}`}
          >
            <X className="h-5 w-5 lg:h-3.5 lg:w-3.5" />
          </button>

          {/* Home Button */}
          <button
            onClick={() => onSetHome(display.timezone.id)}
            className={cn(
              "flex items-center justify-center h-11 w-11 lg:h-7 lg:w-7 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
              display.timezone.isHome
                ? "text-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
            aria-label={
              display.timezone.isHome
                ? `${display.timezone.city} is the home timezone`
                : `Set ${display.timezone.city} as home timezone`
            }
          >
            <Home
              className={cn(
                "h-5 w-5 lg:h-3.5 lg:w-3.5",
                display.timezone.isHome && "fill-current"
              )}
            />
          </button>
        </div>

        {/* City/Country + Current Time (sticky to the left across sizes) */}
        <div
          ref={infoRef}
          className={cn(
            "w-full lg:w-64 shrink-0 px-0 py-3 lg:px-2 lg:py-0 sticky left-0 z-20 bg-white lg:bg-transparent shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)] lg:shadow-none flex items-center mb-1 lg:mb-0 lg:mr-3"
          )}
        >
          <div className="flex w-full items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* Mobile edit-mode controls to the left of city */}
              {isMobile && isEditMode && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Home Button (mobile edit mode) */}
                  <button
                    onClick={() => onSetHome(display.timezone.id)}
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                      display.timezone.isHome
                        ? "text-slate-700 bg-slate-100"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                    aria-label={
                      display.timezone.isHome
                        ? `${display.timezone.city} is the home timezone`
                        : `Set ${display.timezone.city} as home timezone`
                    }
                  >
                    <Home
                      className={cn(
                        "h-4 w-4",
                        display.timezone.isHome && "fill-current"
                      )}
                    />
                  </button>
                  {/* Remove Button (mobile edit mode) */}
                  <button
                    onClick={() => onRemove(display.timezone.id)}
                    className="flex items-center justify-center h-8 w-8 rounded-md text-slate-500 transition-colors hover:text-red-600 hover:bg-red-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    aria-label={`Remove ${display.timezone.city}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-lg lg:text-sm font-semibold text-slate-900 leading-tight tracking-tight truncate">
                    {display.timezone.city}
                  </span>
                  <span className="text-xs lg:text-[11px] text-slate-600 leading-tight tracking-tight font-medium shrink-0">
                    {display.offsetDisplay}
                  </span>
                </div>
                <span className="text-xs lg:text-[11px] text-slate-500 leading-tight tracking-tight truncate">
                  {display.timezone.country}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isMobile && isEditMode ? (
                <button
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-md text-slate-500 transition-colors hover:text-slate-700 hover:bg-slate-50 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  )}
                  aria-label={`Reorder ${display.timezone.city}`}
                  {...dragHandleProps}
                >
                  <GripHorizontal className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-2xl font-semibold tracking-tight text-foreground leading-tight lg:text-base">
                    {display.formattedTime}
                  </span>
                  <span className="text-xs lg:text-[11px] text-muted-foreground leading-tight tracking-tight">
                    {display.formattedDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {!(isMobile && isEditMode) && (
          <div className="relative flex w-full pl-0 lg:pl-4 flex-1 xl:min-w-0 items-center">
            <div
              data-timeline-flex-container
              className="relative flex items-center rounded-md border border-slate-400 overflow-hidden w-[1344px] lg:w-[1200px] xl:w-full xl:flex-1 shrink-0 h-[52px] lg:h-auto"
            >
              {referenceHours.map((referenceHourDate, hourIndex) => (
                <HourCell
                  key={hourIndex}
                  referenceHourDate={referenceHourDate}
                  timezoneId={display.timezone.id}
                  hourIndex={hourIndex}
                  totalHours={referenceHours.length}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
