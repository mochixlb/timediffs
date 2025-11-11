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
}: TimezoneRowProps) {
  return (
    <div>
      <div
        className={cn(
          "group relative flex items-center pt-0.5 overflow-visible min-h-[38px] rounded-md",
          isDragging && "bg-white shadow-lg shadow-slate-900/10"
        )}
      >
        {/* Control Buttons Group */}
        <div className="flex items-center gap-1 shrink-0 mr-3">
          {/* Drag Handle */}
          <button
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-md text-slate-400 transition-colors hover:text-slate-600 hover:bg-slate-50 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            )}
            aria-label={`Reorder ${display.timezone.city}`}
            {...dragHandleProps}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(display.timezone.id)}
            className="flex items-center justify-center h-7 w-7 rounded-md text-slate-500 transition-colors hover:text-red-600 hover:bg-red-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label={`Remove ${display.timezone.city}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Home Button */}
          <button
            onClick={() => onSetHome(display.timezone.id)}
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
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
                "h-3.5 w-3.5",
                display.timezone.isHome && "fill-current"
              )}
            />
          </button>
        </div>

        {/* City and Country Info */}
        <div className="w-32 shrink-0 px-2 sm:w-40">
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-foreground leading-tight tracking-tight">
                {display.timezone.city}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight tracking-tight">
                {display.offsetDisplay}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight tracking-tight">
              {display.timezone.country}
            </span>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="w-24 shrink-0 px-2 sm:w-28">
          <div className="flex flex-col items-start gap-[2px]">
            <span className="text-base font-semibold tracking-tight text-foreground leading-tight">
              {display.formattedTime}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight tracking-tight">
              {display.formattedDate}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-1 pl-3 sm:pl-4">
          <div
            data-timeline-flex-container
            className="relative flex flex-1 items-start rounded-md border border-slate-400 overflow-hidden"
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
