"use client";

import { X } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useTimezone } from "@/contexts/timezone-context";
import { getTimelineHours, getTimeOfDay } from "@/lib/timezone";
import { cn } from "@/lib/utils";

interface TimelineVisualizationProps {
  onRemoveTimezone: (timezoneId: string) => void;
}

export function TimelineVisualization({
  onRemoveTimezone,
}: TimelineVisualizationProps) {
  const { timezoneDisplays } = useTimezone();
  const selectedDate = new Date();

  const referenceTimezone = timezoneDisplays[0];
  const referenceHours = referenceTimezone
    ? getTimelineHours(referenceTimezone.timezone.id, selectedDate)
    : [];

  const now = new Date();

  if (timezoneDisplays.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative min-w-[800px] sm:min-w-[1200px]">
        {timezoneDisplays.map((display) => {
          const tzCurrentHour = parseInt(
            formatInTimeZone(now, display.timezone.id, "H"),
            10
          );
          const tzCurrentMinute = parseInt(
            formatInTimeZone(now, display.timezone.id, "m"),
            10
          );

          return (
            <div key={display.timezone.id} className="mb-3 last:mb-0">
              <div className="group relative flex items-center pb-2 pt-0.5 overflow-visible min-h-[38px]">
                <div className="w-6 shrink-0 flex items-center justify-center -ml-1 mr-3">
                  <button
                    onClick={() => onRemoveTimezone(display.timezone.id)}
                    className="flex items-center justify-center h-7 w-7 rounded-md text-slate-500 transition-colors hover:text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    aria-label={`Remove ${display.timezone.city}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

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

                <div className="relative flex flex-1 pl-2 sm:pl-3">
                  <div className="relative flex flex-1 items-start rounded-md border border-slate-400 overflow-hidden">
                    {referenceHours.map((referenceHourDate, hourIndex) => {
                      const hourInTz = parseInt(
                        formatInTimeZone(
                          referenceHourDate,
                          display.timezone.id,
                          "H"
                        ),
                        10
                      );
                      const hour12 = parseInt(
                        formatInTimeZone(
                          referenceHourDate,
                          display.timezone.id,
                          "h"
                        ),
                        10
                      );
                      const amPm = formatInTimeZone(
                        referenceHourDate,
                        display.timezone.id,
                        "a"
                      ).toLowerCase();
                      const isNewDay = hourInTz === 0;

                      const monthLabel = isNewDay
                        ? formatInTimeZone(
                            referenceHourDate,
                            display.timezone.id,
                            "MMM"
                          )
                        : null;
                      const dayLabel = isNewDay
                        ? formatInTimeZone(
                            referenceHourDate,
                            display.timezone.id,
                            "d"
                          )
                        : null;

                      const timeOfDay = getTimeOfDay(hourInTz);

                      const currentHourInTz = parseInt(
                        formatInTimeZone(now, display.timezone.id, "H"),
                        10
                      );
                      const currentDayInTz = parseInt(
                        formatInTimeZone(now, display.timezone.id, "d"),
                        10
                      );
                      const refDayInTz = parseInt(
                        formatInTimeZone(
                          referenceHourDate,
                          display.timezone.id,
                          "d"
                        ),
                        10
                      );
                      const isCurrent =
                        hourInTz === currentHourInTz &&
                        refDayInTz === currentDayInTz;

                      const timeOfDayConfig = {
                        day: {
                          bg: "bg-amber-100",
                          text: "text-amber-900",
                          textMuted: "text-amber-700",
                        },
                        evening: {
                          bg: "bg-indigo-100",
                          text: "text-indigo-900",
                          textMuted: "text-indigo-700",
                        },
                        night: {
                          bg: "bg-slate-100",
                          text: "text-slate-900",
                          textMuted: "text-slate-700",
                        },
                      };

                      const currentConfig = {
                        bg: "bg-orange-200",
                        text: "text-orange-900",
                        textMuted: "text-orange-700",
                      };

                      const newDayConfig = {
                        bg: "bg-violet-100",
                        text: "text-violet-900",
                        textMuted: "text-violet-700",
                      };

                      const config = isCurrent
                        ? currentConfig
                        : isNewDay
                        ? newDayConfig
                        : timeOfDayConfig[timeOfDay];

                      const isFirstHour = hourIndex === 0;
                      const isLastHour =
                        hourIndex === referenceHours.length - 1;

                      return (
                        <div
                          key={hourIndex}
                          className={cn(
                            "relative flex-1 flex flex-col items-center justify-center min-h-[38px]",
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

                          {isCurrent && (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-orange-500 pointer-events-none z-20"
                              style={{
                                left: `${(tzCurrentMinute / 60) * 100}%`,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
