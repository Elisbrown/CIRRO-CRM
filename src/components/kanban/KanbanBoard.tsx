"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { useServiceRequestsList, useUpdateServiceRequest } from "@/hooks/use-data";

const COLUMNS = [
  { id: "DRAFT", title: "Waitlist / Draft" },
  { id: "APPROVED", title: "Approved" },
  { id: "IN_PROGRESS", title: "In Production" },
  { id: "COMPLETED", title: "Completed" },
  { id: "CANCELED", title: "Canceled" },
];

export function KanbanBoard() {
  const { data: srData, isLoading } = useServiceRequestsList({ limit: 100 });
  const updateSR = useUpdateServiceRequest();

  const [items, setItems] = useState<Record<string, any[]>>({
    DRAFT: [],
    APPROVED: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    CANCELED: [],
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialContainer, setInitialContainer] = useState<string | null>(null);

  useEffect(() => {
    if (srData?.items) {
      const grouped = srData.items.reduce((acc, item) => {
        const status = item.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(item);
        return acc;
      }, { DRAFT: [], APPROVED: [], IN_PROGRESS: [], COMPLETED: [], CANCELED: [] } as Record<string, any[]>);
      setItems(grouped);
    }
  }, [srData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    if (id in items) return id;
    return Object.keys(items).find((key) => items[key].find((item) => String(item.id) === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setInitialContainer(findContainer(event.active.id as string) || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((item) => String(item.id) === active.id);
      const overIndex = overItems.findIndex((item) => String(item.id) === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: activeItems.filter((item) => String(item.id) !== active.id),
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex),
        ],
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || !initialContainer) {
      setActiveId(null);
      setInitialContainer(null);
      return;
    }

    const overContainer = findContainer(overId as string);

    if (overContainer) {
      if (initialContainer !== overContainer) {
        // CROSS-COLUMN MOVE
        const item = srData?.items?.find((i) => String(i.id) === active.id);
        if (item) {
          console.log(`[Kanban] MOVE: SR#${item.requestId} from ${initialContainer} to ${overContainer}`);
          try {
            await updateSR.mutateAsync({
              id: item.id,
              data: { status: overContainer as any },
            });
          } catch (err) {
            console.error("[Kanban] API Error:", err);
            // Revert state on failure
            if (srData?.items) {
              const grouped = srData.items.reduce((acc, item) => {
                const status = item.status;
                if (!acc[status]) acc[status] = [];
                acc[status].push(item);
                return acc;
              }, { DRAFT: [], APPROVED: [], IN_PROGRESS: [], COMPLETED: [], CANCELED: [] } as Record<string, any[]>);
              setItems(grouped);
            }
          }
        }
      } else {
        // SAME-COLUMN REORDER
        const activeIndex = items[initialContainer].findIndex((item) => String(item.id) === active.id);
        const overIndex = items[overContainer].findIndex((item) => String(item.id) === overId);
        
        if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
          setItems((prev) => ({
            ...prev,
            [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
          }));
        }
      }
    }

    setActiveId(null);
    setInitialContainer(null);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Kanban board...</div>;

  return (
    <div className="flex h-[calc(100vh-180px)] overflow-x-auto gap-6 pb-6 p-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            items={items[col.id] || []}
          />
        ))}
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}>
          {activeId ? (
            <KanbanCard
              id={activeId}
              item={Object.values(items).flat().find((i) => String(i.id) === activeId)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
