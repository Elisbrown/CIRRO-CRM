"use client";

import { useMaintenanceLogsList } from "@/hooks/use-data";
import { format } from "date-fns";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { X, Clock } from "lucide-react";

interface MaintenanceHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: number | null;
  machineName?: string;
}

export function MaintenanceHistoryDrawer({ isOpen, onClose, machineId, machineName }: MaintenanceHistoryDrawerProps) {
  const { data, isLoading } = useMaintenanceLogsList({ 
    machineId: machineId || undefined,
    limit: 50,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-gray-50 shadow-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Maintenance History</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">{machineName}</p>
        </div>
        <button onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading history...</div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-200">
            No maintenance records found for this machine.
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-200 ml-3 pl-6 space-y-8">
            {data?.items.map((log) => (
              <div key={log.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-gray-1000 shadow-sm" />
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.createdAt), "MMM d, yyyy")}
                    </div>
                    <StatusBadge value={log.status} className="scale-75 origin-right" />
                  </div>
                  
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">
                    {log.action}
                  </p>
                  
                  {log.cost > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Repair Cost</span>
                      <span className="text-sm font-bold text-brand-700">XAF {log.cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
