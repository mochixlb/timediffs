"use client";

import { useTimezone } from "@/contexts/timezone-context";
import { getTimelineHours } from "@/lib/timezone";
import { useColumnHighlight } from "@/hooks/use-column-highlight";
import { useTimelineHover } from "@/hooks/use-timeline-hover";
import { ColumnHighlightRing } from "./column-highlight-ring";
import { useState, useMemo } from "react";
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
}

/**
 * Main timeline visualization component that displays multiple timezones
 * in a horizontal 24-hour timeline with interactive hover effects.
 */
export function TimelineVisualization({
  onRemoveTimezone,
}: TimelineVisualizationProps) {
  const { timezoneDisplays, setHomeTimezone, reorderTimezones } = useTimezone();
  const now = new Date();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Use home timezone as reference, or fallback to first timezone
  const referenceTimezone =
    timezoneDisplays.find((d) => d.timezone.isHome) || timezoneDisplays[0];
  const referenceHours = referenceTimezone
    ? getTimelineHours(referenceTimezone.timezone.id, now)
    : [];

  // Track mouse hover position
  const {
    timelineContainerRef,
    hoveredColumnIndex,
    handleMouseMove,
    handleMouseLeave,
  } = useTimelineHover(referenceHours.length);

  // Calculate which column to highlight (hover or current time)
  const { highlightedColumnIndex } = useColumnHighlight({
    referenceTimezone,
    referenceHours,
    now,
    hoveredColumnIndex,
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
    <div className="w-full overflow-x-auto">
      <div
        ref={timelineContainerRef}
        data-timeline-container
        className="relative min-w-[800px] sm:min-w-[1200px]"
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
            {timezoneDisplays.map((display) => (
              <div key={display.timezone.id} className="mb-4 last:mb-0">
                <SortableTimezoneRow
                  display={display}
                  referenceHours={referenceHours}
                  onRemove={onRemoveTimezone}
                  onSetHome={setHomeTimezone}
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
                  onRemove={onRemoveTimezone}
                  onSetHome={setHomeTimezone}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
