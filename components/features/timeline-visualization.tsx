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
              <div className="group relative flex items-center pb-2 pt-0.5 overflow-visible">
                <div className="w-6 shrink-0 flex items-center justify-center -ml-1 mr-3">
                  <button
                    onClick={() => onRemoveTimezone(display.timezone.id)}
                    className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Remove ${display.timezone.city}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="w-32 shrink-0 px-2 sm:w-40">
                  <div className="flex flex-col gap-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-foreground leading-tight">
                        {display.timezone.city}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        {display.offsetDisplay}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {display.timezone.country}
                    </span>
                  </div>
                </div>

                <div className="w-24 shrink-0 px-2 sm:w-28">
                  <div className="flex flex-col items-start gap-0">
                    <span className="text-base font-semibold tracking-tight text-foreground leading-tight">
                      {display.formattedTime}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {display.formattedDate}
                    </span>
                  </div>
                </div>

                <div className="relative flex flex-1 pl-2 sm:pl-3">
                  <div className="relative flex flex-1 items-start rounded-lg border border-slate-200/60 overflow-hidden">
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
                          bg: "bg-amber-50/90",
                          text: "text-amber-950",
                          textMuted: "text-amber-800",
                        },
                        evening: {
                          bg: "bg-indigo-50/85",
                          text: "text-indigo-950",
                          textMuted: "text-indigo-800",
                        },
                        night: {
                          bg: "bg-slate-100/80",
                          text: "text-slate-950",
                          textMuted: "text-slate-700",
                        },
                      };

                      const currentConfig = {
                        bg: "bg-orange-100/90 ring-1 ring-orange-300/60",
                        text: "text-orange-950",
                        textMuted: "text-orange-800",
                      };

                      const newDayConfig = {
                        bg: "bg-violet-100/90",
                        text: "text-violet-950",
                        textMuted: "text-violet-800",
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
                            "relative flex-1 transition-colors flex flex-col items-center justify-center aspect-square min-h-[36px] max-h-[40px]",
                            config.bg,
                            isFirstHour && "rounded-l-lg",
                            isLastHour && "rounded-r-lg"
                          )}
                          title={`${hourInTz}:00`}
                        >
                          {isNewDay && monthLabel && dayLabel ? (
                            <div className="flex flex-col items-center gap-0.5 z-10">
                              <span
                                className={cn(
                                  "text-xs font-semibold leading-none",
                                  config.text
                                )}
                              >
                                {monthLabel}
                              </span>
                              <span
                                className={cn(
                                  "text-[9px] leading-none",
                                  config.textMuted
                                )}
                              >
                                {dayLabel}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5 z-10">
                              <span
                                className={cn(
                                  "text-xs font-semibold leading-none",
                                  config.text
                                )}
                              >
                                {hour12}
                              </span>
                              <span
                                className={cn(
                                  "text-[9px] leading-none",
                                  config.textMuted
                                )}
                              >
                                {amPm}
                              </span>
                            </div>
                          )}

                          {isCurrent && (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-orange-600/70 pointer-events-none z-20"
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
