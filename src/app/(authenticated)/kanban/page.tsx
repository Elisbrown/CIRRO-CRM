"use client";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function KanbanPage() {
  return (
    <div className="flex flex-col h-full animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Workflow Board</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage service requests through production stages</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/service-requests"
            className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          >
            List View
          </Link>
          <button
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </div>
  );
}
