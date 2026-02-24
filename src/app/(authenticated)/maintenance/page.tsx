"use client";

import { useState } from "react";
import { useMaintenanceLogsList, useDeleteMaintenanceLog } from "@/hooks/use-data";
import { MaintenanceDrawer } from "@/components/maintenance/MaintenanceDrawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Plus, Search, Filter, Trash2, Edit2, Wrench, Settings } from "lucide-react";
import { format } from "date-fns";

export default function MaintenanceLogsPage() {
  const [params, setParams] = useState({ page: 1, limit: 10, machineId: undefined });
  const { data, isLoading } = useMaintenanceLogsList(params as any);
  const deleteLog = useDeleteMaintenanceLog();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const handleEdit = (log: any) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedLog(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      await deleteLog.mutateAsync(id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Machine Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">Track repairs, calibrations, and upkeep costs</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Log Maintenance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Wrench className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Actions</p>
            <p className="text-2xl font-bold text-gray-900">{data?.pagination.total || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <Settings className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Down Machines</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <Settings className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Monthly Cost</p>
            <p className="text-2xl font-bold text-gray-900">XAF 450,000</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Machine</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action Description</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status Post-Action</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No maintenance logs found.</td></tr>
            ) : (
              data?.items.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {format(new Date(log.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.machine.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {log.cost > 0 ? `XAF ${log.cost.toLocaleString()}` : "Free / Internal"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={log.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(log)} className="p-1.5 text-gray-400 hover:text-brand-600 rounded-md hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(log.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <MaintenanceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}
