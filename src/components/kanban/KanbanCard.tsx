"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { User, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

interface KanbanCardProps {
  id: string;
  item: any;
}

export function KanbanCard({ id, item }: KanbanCardProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-black transition-colors cursor-grab active:cursor-grabbing mb-3 group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {item.requestId}
        </span>
        <Link 
          href={`/service-requests?edit=${item.id}`}
          className="text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking link
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
        {item.contact.companyName || `${item.contact.firstName} ${item.contact.lastName}`}
      </h4>

      {item.service && (
        <div className="text-xs text-gray-600 mb-3 bg-gray-50 px-2 py-1 rounded inline-block">
          {item.service.serviceName}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <User className="w-3 h-3" />
          <span>{item.contact.firstName} {item.contact.lastName}</span>
        </div>
        
        {item.deliveryDate && (
          <div className={`flex items-center gap-1.5 text-[11px] ${new Date(item.deliveryDate) < new Date() && item.status !== 'COMPLETED' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(item.deliveryDate), "MMM d")}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
        <StatusBadge value={item.businessUnit} className="scale-90 origin-left" />
        <span className="text-xs font-bold text-black">
          {item.finalAmount ? `XAF ${item.finalAmount.toLocaleString()}` : "Pending"}
        </span>
      </div>
    </div>
  );
}
