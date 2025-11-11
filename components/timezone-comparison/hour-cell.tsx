import { formatInTimeZone } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { getTimeOfDay } from "@/lib/timezone";
import { TIME_OF_DAY_CONFIG, NEW_DAY_CONFIG } from "@/lib/timeline-constants";
import { useTimezone } from "@/contexts/timezone-context";

interface HourCellProps {
  referenceHourDate: Date;
  timezoneId: string;
  hourIndex: number;
  totalHours: number;
}

/**
 * Renders a single hour cell in the timeline visualization.
 * Displays hour in 12-hour (AM/PM) or 24-hour format based on user preference,
 * or date for new day markers.
 */
export function HourCell({
  referenceHourDate,
  timezoneId,
  hourIndex,
  totalHours,
}: HourCellProps) {
  const { timeFormat } = useTimezone();
  const hourInTz = parseInt(
    formatInTimeZone(referenceHourDate, timezoneId, "H"),
    10
  );
  const hour12 = parseInt(
    formatInTimeZone(referenceHourDate, timezoneId, "h"),
    10
  );
  const amPm = formatInTimeZone(
    referenceHourDate,
    timezoneId,
    "a"
  ).toLowerCase();
  const isNewDay = hourInTz === 0;

  const monthLabel = isNewDay
    ? formatInTimeZone(referenceHourDate, timezoneId, "MMM")
    : null;
  const dayLabel = isNewDay
    ? formatInTimeZone(referenceHourDate, timezoneId, "d")
    : null;

  const timeOfDay = getTimeOfDay(hourInTz);
  const config = isNewDay ? NEW_DAY_CONFIG : TIME_OF_DAY_CONFIG[timeOfDay];

  const isFirstHour = hourIndex === 0;
  const isLastHour = hourIndex === totalHours - 1;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center h-[44px] lg:h-auto lg:min-h-[38px] w-[50px] lg:w-[50px] xl:flex-1 shrink-0",
        config.bg,
        !isLastHour && "border-r border-slate-200",
        isFirstHour && "rounded-l-md",
        isLastHour && "rounded-r-md"
      )}
      title={`${hourInTz}:00`}
    >
      {isNewDay && monthLabel && dayLabel ? (
        <div className="flex flex-col items-center gap-[2px] z-10">
          <span
            className={cn(
              "text-xs font-semibold leading-tight tracking-tight",
              config.text
            )}
          >
            {monthLabel}
          </span>
          <span
            className={cn(
              "text-[10px] leading-tight tracking-tight",
              config.textMuted
            )}
          >
            {dayLabel}
          </span>
        </div>
      ) : timeFormat === "24h" ? (
        <div className="flex flex-col items-center justify-center z-10">
          <span
            className={cn(
              "text-xs font-semibold leading-tight tracking-tight",
              config.text
            )}
          >
            {hourInTz.toString().padStart(2, "0")}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-[2px] z-10">
          <span
            className={cn(
              "text-xs font-semibold leading-tight tracking-tight",
              config.text
            )}
          >
            {hour12}
          </span>
          <span
            className={cn(
              "text-[10px] leading-tight tracking-tight",
              config.textMuted
            )}
          >
            {amPm}
          </span>
        </div>
      )}
    </div>
  );
}
