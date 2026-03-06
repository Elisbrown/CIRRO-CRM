"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  defaultDropAnimationSideEffects,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUpdateTask } from "@/hooks/use-data";
import { User, Clock, Paperclip, MessageSquare, ListChecks } from "lucide-react";

interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  isRecurring: boolean;
  assignee: { id: number; firstName: string; lastName: string } | null;
  _count: { comments: number; subTasks: number; attachments: number };
}

interface TaskKanbanBoardProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  userRole: string;
}

const COLUMNS = [
  { id: "TODO", label: "To Do", color: "bg-gray-50", dotColor: "bg-gray-400" },
  { id: "DOING", label: "In Progress", color: "bg-blue-50/50", dotColor: "bg-blue-500" },
  { id: "BLOCKED", label: "Blocked", color: "bg-red-50/50", dotColor: "bg-red-500" },
  { id: "PENDING_APPROVAL", label: "Pending Approval", color: "bg-yellow-50/50", dotColor: "bg-yellow-500" },
  { id: "DONE", label: "Done", color: "bg-green-50/50", dotColor: "bg-green-500" },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-200 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
}: {
  column: typeof COLUMNS[0];
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] bg-gray-100/50 rounded-xl max-h-full border border-gray-200/50">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{column.label}</h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-gray-500 border border-gray-100">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-3 min-h-[400px]"
      >
        <SortableContext
          id={column.id}
          items={tasks.map((task) => String(task.id))}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} id={String(task.id)} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-[10px] text-gray-400">Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ id, task, onClick }: { id: string; task: TaskItem; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
  const isDueSoon =
    task.dueDate &&
    !isOverdue &&
    new Date(task.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
    task.status !== "DONE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-black transition-all cursor-grab active:cursor-grabbing group ${
        isDragging ? "shadow-lg scale-105" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {task.title}
        </h4>
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-medium">
        {task.assignee && (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md">
            <User className="w-3 h-3 text-gray-400" />
            {task.assignee.firstName}
          </span>
        )}
        {task.dueDate && (
          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${isOverdue ? "bg-red-50 text-red-600" : isDueSoon ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-500"}`}>
            <Clock className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
        {task.isRecurring && (
          <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md">
            ↻
          </span>
        )}
      </div>

      {(task._count.comments > 0 || task._count.subTasks > 0 || task._count.attachments > 0) && (
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400">
          {task._count.subTasks > 0 && (
            <span className="flex items-center gap-1.5 bg-gray-50/50 px-1.5 py-0.5 rounded">
              <ListChecks className="w-3 h-3" /> {task._count.subTasks}
            </span>
          )}
          {task._count.comments > 0 && (
            <span className="flex items-center gap-1.5 bg-gray-50/50 px-1.5 py-0.5 rounded">
              <MessageSquare className="w-3 h-3" /> {task._count.comments}
            </span>
          )}
          {task._count.attachments > 0 && (
            <span className="flex items-center gap-1.5 bg-gray-50/50 px-1.5 py-0.5 rounded">
              <Paperclip className="w-3 h-3" /> {task._count.attachments}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function TaskKanbanBoard({ tasks, onTaskClick, userRole }: TaskKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialContainer, setInitialContainer] = useState<string | null>(null);
  const updateTask = useUpdateTask(Number(activeId) || 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const [items, setItems] = useState<Record<string, TaskItem[]>>({
    TODO: [],
    DOING: [],
    BLOCKED: [],
    PENDING_APPROVAL: [],
    DONE: [],
  });

  useMemo(() => {
    const grouped: Record<string, TaskItem[]> = {};
    COLUMNS.forEach((col) => (grouped[col.id] = []));
    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    setItems(grouped);
  }, [tasks]);

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

    setItems((prev: Record<string, TaskItem[]>) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((item: TaskItem) => String(item.id) === active.id);
      const overIndex = overItems.findIndex((item: TaskItem) => String(item.id) === overId);

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

    if (overContainer && initialContainer !== overContainer) {
      let finalStatus = overContainer;

      // Staff cannot drag to DONE directly — it becomes PENDING_APPROVAL
      if (userRole === "STAFF" && overContainer === "DONE") {
        finalStatus = "PENDING_APPROVAL";
      }

      try {
        await updateTask.mutateAsync({ status: finalStatus as any });
      } catch (err) {
        console.error("Task move failed:", err);
      }
    }

    setActiveId(null);
    setInitialContainer(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 p-2 h-[calc(100vh-200px)]">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={items[column.id] || []}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: "0.3",
            },
          },
        }),
      }}>
        {activeId ? (
          <div className="opacity-95 shadow-2xl">
            <TaskCard
              id={activeId}
              task={Object.values(items).flat().find((t) => String(t.id) === activeId)!}
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
