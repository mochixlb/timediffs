"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TimezoneDisplay } from "@/types";
import { TimezoneRow } from "./timezone-row";

interface SortableTimezoneRowProps {
  display: TimezoneDisplay;
  referenceHours: Date[];
  onRemove: (timezoneId: string) => void;
  onSetHome: (timezoneId: string) => void;
}

export function SortableTimezoneRow({
  display,
  referenceHours,
  onRemove,
  onSetHome,
}: SortableTimezoneRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: display.timezone.id });

  const style = useMemo<React.CSSProperties>(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
      // Keep height during drag for smoother list behavior
      willChange: "transform",
      // Hide the original item while dragging to avoid duplicate under the overlay
      opacity: isDragging ? 0 : undefined,
    };
  }, [transform, transition]);

  return (
    <div ref={setNodeRef} style={style}>
      <TimezoneRow
        display={display}
        referenceHours={referenceHours}
        onRemove={onRemove}
        onSetHome={onSetHome}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}


