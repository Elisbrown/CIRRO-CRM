"use client";

import { useState } from "react";
import { useCleaningLogsList, useDeleteCleaningLog } from "@/hooks/use-data";
import { CleaningDrawer } from "@/components/cleaning/CleaningDrawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Plus, Search, Filter, Trash2, Edit2, Droplets, TrendingUp, AlertTriangle } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function CleaningLogsPage() {
  const [params, setParams] = useState({ page: 1, limit: 10, zone: "" });
  const { data, isLoading } = useCleaningLogsList(params);
  const deleteLog = useDeleteCleaningLog();

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
    if (confirm("Are you sure you want to delete this cleaning record?")) {
      await deleteLog.mutateAsync(id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cleaning & Facility Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor zone cleanliness and inspector grades</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Log Cleaning
        </button>
      </div>

      {/* Visual Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Cleanliness Grade History
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { date: 'Feb 14', grade: 4.2 },
                { date: 'Feb 15', grade: 3.8 },
                { date: 'Feb 16', grade: 4.5 },
                { date: 'Feb 17', grade: 3.0 },
                { date: 'Feb 18', grade: 4.8 },
                { date: 'Feb 19', grade: 4.0 },
                { date: 'Feb 20', grade: 4.3 },
              ]}>
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-gray-100 shadow-lg rounded-lg text-xs font-bold">
                          Grade: {payload[0].value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="grade" radius={[4, 4, 0, 0]}>
                  { [1,2,3,4,5,6,7].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#0f172a' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Grade</p>
            <p className="text-3xl font-black text-gray-900">4.1</p>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
              +12% vs last month
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Deductions</p>
            <p className="text-3xl font-black text-gray-900 text-red-600">XAF 15k</p>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit">
              <AlertTriangle className="w-3 h-3" /> 2 Fails recorded
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cleaner</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Zone</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Deduction</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Result</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No cleaning logs found.</td></tr>
            ) : (
              data?.items.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {format(new Date(log.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.cleaner.firstName} {log.cleaner.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-tight">
                      {log.zone.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`h-1.5 w-4 rounded-full ${s <= log.grade ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-500">
                    {log.deduction > 0 ? `XAF ${log.deduction.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={log.result} />
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

        {data && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {data.items.length} of {data.pagination.total} records
            </span>
            <div className="flex gap-2">
              <button
                disabled={params.page === 1}
                onClick={() => setParams({ ...params, page: params.page - 1 })}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={params.page === data.pagination.totalPages}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CleaningDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}
