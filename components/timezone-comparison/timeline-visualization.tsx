"use client";

import { useTimezone } from "@/contexts/timezone-context";
import { getTimelineHours } from "@/lib/timezone";
import { useColumnHighlight } from "@/hooks/use-column-highlight";
import { useTimelineHover } from "@/hooks/use-timeline-hover";
import { ColumnHighlightRing } from "./column-highlight-ring";
import { useState, useMemo, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableTimezoneRow } from "./sortable-timezone-row";
import { TimezoneRow } from "./timezone-row";

interface TimelineVisualizationProps {
  onRemoveTimezone: (timezoneId: string) => void;
  isEditMode?: boolean;
}

/**
 * Main timeline visualization component that displays multiple timezones
 * in a horizontal 24-hour timeline with interactive hover effects.
 */
export function TimelineVisualization({
  onRemoveTimezone,
  isEditMode = false,
}: TimelineVisualizationProps) {
  const { timezoneDisplays, setHomeTimezone, reorderTimezones, selectedDate } =
    useTimezone();
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const hasUserScrolledRef = useRef(false);
  const programmaticScrollRef = useRef(false);

  // Use home timezone as reference, or fallback to first timezone
  const referenceTimezone =
    timezoneDisplays.find((d) => d.timezone.isHome) || timezoneDisplays[0];
  const referenceHours = referenceTimezone
    ? getTimelineHours(referenceTimezone.timezone.id, selectedDate)
    : [];

  // Track mouse hover position
  const {
    timelineContainerRef,
    hoveredColumnIndex,
    handleMouseMove,
    handleMouseLeave,
  } = useTimelineHover(referenceHours.length);

  // Calculate which column to highlight (hover or current time)
  // Only highlight current time if viewing today's date
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  }, [selectedDate]);

  const { highlightedColumnIndex } = useColumnHighlight({
    referenceTimezone,
    referenceHours,
    now: isToday ? new Date() : selectedDate,
    hoveredColumnIndex,
    shouldHighlightCurrentTime: isToday,
  });

  // Track whether the user has manually scrolled (to avoid recentering afterwards)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!programmaticScrollRef.current) {
        hasUserScrolledRef.current = true;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Center the current time column on mobile (7-block view) if possible
  useEffect(() => {
    if (!isMobile || !isToday) return;
    if (highlightedColumnIndex === null) return;
    if (!scrollContainerRef.current) return;
    if (hasUserScrolledRef.current) return;

    const parentContainer = document.querySelector(
      "[data-timeline-container]"
    ) as HTMLElement | null;
    const flexContainer = parentContainer?.querySelector(
      "[data-timeline-flex-container]"
    ) as HTMLElement | null;

    const targetCell =
      flexContainer?.children[
        Math.max(0, Math.min(highlightedColumnIndex, referenceHours.length - 1))
      ] as HTMLElement | undefined;

    if (!targetCell) return;

    programmaticScrollRef.current = true;
    // Center the current hour cell horizontally in the scroll container
    targetCell.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
    });
    // Allow subsequent user scrolls to be detected
    requestAnimationFrame(() => {
      programmaticScrollRef.current = false;
    });
  }, [
    isMobile,
    isToday,
    highlightedColumnIndex,
    referenceHours.length,
    timezoneDisplays.length,
  ]);

  // Recenter on resize if user hasn't scrolled yet (keeps 7-block center on orientation change)
  useEffect(() => {
    if (!isMobile) return;
    const handler = () => {
      // Trigger the effect above by toggling a no-op state via reflow; simplest is to rely on highlightedColumnIndex dependency
      if (!hasUserScrolledRef.current) {
        const parentContainer = document.querySelector(
          "[data-timeline-container]"
        ) as HTMLElement | null;
        const flexContainer = parentContainer?.querySelector(
          "[data-timeline-flex-container]"
        ) as HTMLElement | null;
        // Force re-measure by touching layout
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        flexContainer && flexContainer.getBoundingClientRect();
        // Schedule a micro task so the main effect can run again
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            // no-op; dependencies will cause recenter
          }
        });
      }
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isMobile]);
  if (timezoneDisplays.length === 0) {
    return null;
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const items = useMemo(
    () => timezoneDisplays.map((d) => d.timezone.id),
    [timezoneDisplays]
  );

  const activeDisplay = useMemo(
    () => timezoneDisplays.find((d) => d.timezone.id === activeId) || null,
    [activeId, timezoneDisplays]
  );

  return (
    <div
      ref={scrollContainerRef}
      className="w-full overflow-x-auto lg:overflow-x-auto xl:overflow-x-visible"
      tabIndex={0}
      role="region"
      aria-label="Timezone comparison timeline"
    >
      <div
        ref={timelineContainerRef}
        data-timeline-container
        className="relative min-w-0 lg:min-w-[1650px] xl:min-w-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Single column highlight ring spanning all rows */}
        <ColumnHighlightRing
          columnIndex={highlightedColumnIndex}
          totalColumns={referenceHours.length}
          isHovered={hoveredColumnIndex !== null}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={(event: DragStartEvent) => {
            const id = String(event.active.id);
            setActiveId(id);
          }}
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(null);
            if (!over) return;
            const activeIndex = items.indexOf(String(active.id));
            const overIndex = items.indexOf(String(over.id));
            if (activeIndex !== overIndex) {
              const newOrder = arrayMove(items, activeIndex, overIndex);
              reorderTimezones(newOrder);
            }
          }}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {timezoneDisplays.map((display, index) => (
              <div
                key={display.timezone.id}
                className="mb-3 lg:mb-4 lg:last:mb-0 last:mb-0"
              >
                <SortableTimezoneRow
                  display={display}
                  referenceHours={referenceHours}
                  highlightedColumnIndex={highlightedColumnIndex}
                  onRemove={onRemoveTimezone}
                  onSetHome={setHomeTimezone}
                  isEditMode={isEditMode}
                  isFirst={index === 0}
                  isLast={index === timezoneDisplays.length - 1}
                  scrollContainerRef={scrollContainerRef}
                />
              </div>
            ))}
          </SortableContext>
          <DragOverlay>
            {activeDisplay ? (
              <div className="mb-4 last:mb-0 pointer-events-none">
                <TimezoneRow
                  display={activeDisplay}
                  referenceHours={referenceHours}
                  highlightedColumnIndex={highlightedColumnIndex}
                  onRemove={onRemoveTimezone}
                  onSetHome={setHomeTimezone}
                  isDragging
                  isEditMode={isEditMode}
                  isFirst={
                    timezoneDisplays.findIndex(
                      (d) => d.timezone.id === activeId
                    ) === 0
                  }
                  isLast={
                    timezoneDisplays.findIndex(
                      (d) => d.timezone.id === activeId
                    ) ===
                    timezoneDisplays.length - 1
                  }
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
