declare module "@dnd-kit/core" {
  export const DndContext: any;
  export const DragOverlay: any;
  export const closestCenter: any;
  export const KeyboardSensor: any;
  export const PointerSensor: any;
  export const useSensor: any;
  export const useSensors: any;
  export type DragStartEvent = any;
  export type DragEndEvent = any;
}

declare module "@dnd-kit/sortable" {
  export const SortableContext: any;
  export const verticalListSortingStrategy: any;
  export const arrayMove: <T>(array: T[], from: number, to: number) => T[];
  export const useSortable: any;
  export const sortableKeyboardCoordinates: any;
}

declare module "@dnd-kit/modifiers" {
  export const restrictToVerticalAxis: any;
}

declare module "@dnd-kit/utilities" {
  export const CSS: any;
}




