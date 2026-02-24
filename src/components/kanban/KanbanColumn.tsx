"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  items: any[];
}

export function KanbanColumn({ id, title, items }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-600";
      case "APPROVED": return "bg-gray-100 text-black";
      case "IN_PROGRESS": return "bg-black text-white";
      case "COMPLETED": return "bg-gray-200 text-black";
      case "CANCELED": return "bg-red-50 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex flex-col w-72 min-w-[18rem] bg-gray-50/50 rounded-xl max-h-full border border-gray-100">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getStatusColor(id)}`}>
            {items.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 scrollbar-hide min-h-[500px]"
      >
        <SortableContext
          id={id}
          items={items.map((item) => String(item.id))}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <KanbanCard key={item.id} id={String(item.id)} item={item} />
          ))}
        </SortableContext>
        
        {items.length === 0 && (
          <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-xs text-gray-400">Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
