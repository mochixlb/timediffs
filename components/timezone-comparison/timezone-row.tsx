import { X, Home, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimezoneDisplay } from "@/types";
import { HourCell } from "./hour-cell";

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
}: TimezoneRowProps) {
  return (
    <div>
      <div
        className={cn(
          "group relative flex items-center overflow-visible h-[56px] lg:h-auto lg:min-h-[38px] lg:pt-0.5 lg:rounded-md",
          isDragging && "bg-white shadow-lg shadow-slate-900/10"
        )}
      >
        {/* Control Buttons Group */}
        <div
          className={cn(
            "items-center gap-2 lg:gap-1 shrink-0 mr-2 lg:mr-3",
            "lg:flex", // Always show on larger screens
            isEditMode ? "flex" : "hidden" // Show/hide on mobile based on edit mode
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

        {/* City and Country Info */}
        <div
          className={cn(
            "sticky left-0 z-20 w-32 shrink-0 px-4 py-3 lg:w-40 lg:px-2 lg:py-0 lg:static lg:z-auto bg-white lg:bg-transparent shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)] lg:shadow-none flex items-center h-[56px] lg:h-auto",
            "border-l border-r border-slate-200 lg:border-l-0 lg:border-r-0",
            isFirst && "border-t border-slate-200 lg:border-t-0",
            "border-b border-slate-200 lg:border-b-0"
          )}
        >
          <div className="flex flex-col gap-1 w-full min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-sm font-semibold text-slate-900 leading-tight tracking-tight truncate">
                {display.timezone.city}
              </span>
              <span className="text-[11px] text-slate-600 leading-tight tracking-tight font-medium shrink-0">
                {display.offsetDisplay}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 leading-tight tracking-tight truncate">
              {display.timezone.country}
            </span>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="w-24 shrink-0 px-3 py-3 lg:w-28 lg:px-2 lg:py-0 flex items-center h-[56px] lg:h-auto">
          <div className="flex flex-col items-start gap-1">
            <span className="text-base font-semibold tracking-tight text-foreground leading-tight">
              {display.formattedTime}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight tracking-tight">
              {display.formattedDate}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative flex pl-3 lg:pl-4 flex-1 xl:min-w-0 items-center h-[56px] lg:h-auto">
          <div
            data-timeline-flex-container
            className="relative flex items-center rounded-md border border-slate-400 overflow-hidden w-[1200px] lg:w-[1200px] xl:w-full xl:flex-1 shrink-0 h-[44px] lg:h-auto"
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
      </div>
    </div>
  );
}
