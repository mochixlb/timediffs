"use client";

import { useTimezone } from "@/contexts/timezone-context";
import { getTimelineHours } from "@/lib/timezone";
import { useColumnHighlight } from "@/hooks/use-column-highlight";
import { useTimelineTouch } from "@/hooks/use-timeline-touch";
import { useExactTimePosition } from "@/hooks/use-exact-time-position";
import { ColumnHighlightRing } from "./column-highlight-ring";
import { ExactTimeIndicator } from "./exact-time-indicator";
import { useState, useMemo, useRef } from "react";
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
  const {
    timezoneDisplays,
    setHomeTimezone,
    reorderTimezones,
    selectedDate,
    currentTime,
  } = useTimezone();
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use home timezone as reference, or fallback to first timezone
  const referenceTimezone =
    timezoneDisplays.find((d) => d.timezone.isHome) || timezoneDisplays[0];
  const referenceHours = referenceTimezone
    ? getTimelineHours(referenceTimezone.timezone.id, selectedDate)
    : [];

  // Track mouse hover and touch position
  const {
    timelineContainerRef,
    hoveredColumnIndex,
    touchedColumnIndex,
    activeColumnIndex,
    handleMouseMove,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  } = useTimelineTouch(referenceHours.length);

  // Calculate which column to highlight (on hover or touch)
  // The exact time indicator handles showing the current time position
  const { highlightedColumnIndex } = useColumnHighlight({
    hoveredColumnIndex: activeColumnIndex,
  });

  // Check if viewing today's date for exact time indicator
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  }, [selectedDate]);

  // Calculate exact time position for precise indicator
  const exactTimePosition = useExactTimePosition({
    referenceTimezone,
    referenceHours,
    now: isToday ? currentTime : selectedDate,
    shouldShow: isToday,
  });



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
      className="w-full overflow-x-auto lg:overflow-x-auto xl:overflow-x-visible scroll-touch touch-pan-x"
      tabIndex={0}
      role="region"
      aria-label="Timezone comparison timeline"
    >
      <div
        ref={timelineContainerRef}
        data-timeline-container
        className="relative min-w-0 lg:min-w-[1650px] xl:min-w-0 lg:mt-10 no-tap-highlight"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Single column highlight ring spanning all rows */}
        <ColumnHighlightRing
          columnIndex={highlightedColumnIndex}
          totalColumns={referenceHours.length}
          isHovered={hoveredColumnIndex !== null}
        />

        {/* Exact time indicator showing precise current time position */}
        {referenceTimezone && (
          <ExactTimeIndicator
            position={exactTimePosition}
            totalColumns={referenceHours.length}
            referenceTimezoneId={referenceTimezone.timezone.id}
          />
        )}

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
