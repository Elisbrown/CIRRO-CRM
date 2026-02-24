"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { Plus, Search, Loader2, Trash2, Edit3, Wrench, History } from "lucide-react";
import { MaintenanceDrawer } from "@/components/maintenance/MaintenanceDrawer";
import { MaintenanceHistoryDrawer } from "@/components/maintenance/MaintenanceHistoryDrawer";

function apiFetch(url: string, opts?: RequestInit) {
  return fetch(url, { headers: { "Content-Type": "application/json" }, ...opts }).then(async (r) => {
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
  });
}

interface MachineItem {
  id: number;
  name: string;
  model: string | null;
  status: string;
  lastMaintenanceDate: string | null;
  _count?: { serviceRequests: number; maintenanceLogs: number };
}

export default function MachinesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<MachineItem | null>(null);
  const [maintenanceDrawerOpen, setMaintenanceDrawerOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedMachineName, setSelectedMachineName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["machines-admin", { page, search, statusFilter }],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), limit: "25" });
      if (search) qs.set("search", search);
      if (statusFilter) qs.set("status", statusFilter);
      return apiFetch(`/api/machines?${qs}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => apiFetch("/api/machines", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["machines-admin"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: Record<string, unknown>) => apiFetch(`/api/machines/${id}`, { method: "PUT", body: JSON.stringify(d) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["machines-admin"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/machines/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["machines-admin"] }),
  });

  const [formData, setFormData] = useState({ name: "", model: "", status: "OPERATIONAL" });

  function openCreate() {
    setEditItem(null);
    setFormData({ name: "", model: "", status: "OPERATIONAL" });
    setDrawerOpen(true);
  }

  function openEdit(item: MachineItem) {
    setEditItem(item);
    setFormData({ name: item.name, model: item.model || "", status: item.status });
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      name: formData.name,
      model: formData.model || null,
      status: formData.status,
    };
    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDrawerOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Machines</h1>
          <p className="mt-1 text-sm text-gray-500">Equipment inventory and maintenance tracking</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900">
          <Plus className="h-4 w-4" /> Add Machine
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search machines..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
          <option value="">All Status</option>
          <option value="OPERATIONAL">Operational</option>
          <option value="NEEDS_PARTS">Needs Parts</option>
          <option value="DOWN">Down</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Machine</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Model</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Jobs</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Maint.</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></td></tr>
              ) : !data?.items?.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No machines found</td></tr>
              ) : (
                data.items.map((m: MachineItem) => (
                  <tr key={m.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.status === 'OPERATIONAL' ? 'bg-emerald-100 text-emerald-700' : m.status === 'DOWN' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          <Wrench className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.model || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge value={m.status} /></td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{m._count?.serviceRequests ?? 0}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{m._count?.maintenanceLogs ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(m)} className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-blue-500">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedMachineId(m.id); setMaintenanceDrawerOpen(true); }} 
                          className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-amber-50 hover:text-amber-500"
                          title="Log Maintenance"
                        >
                          <Wrench className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedMachineId(m.id); setSelectedMachineName(m.name); setHistoryDrawerOpen(true); }} 
                          className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-emerald-50 hover:text-emerald-500"
                          title="Maintenance History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button onClick={() => { if (confirm("Delete this machine?")) deleteMutation.mutate(m.id); }} className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data?.pagination && data.pagination.total > 0 && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} limit={data.pagination.limit} onPageChange={setPage} />
        )}
      </div>

      <SlideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editItem ? "Edit Machine" : "Add Machine"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Machine Name *</label>
            <input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="form-input" placeholder="e.g. Canon C5535i" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Model</label>
            <input value={formData.model} onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))} className="form-input" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="form-input">
              <option value="OPERATIONAL">Operational</option>
              <option value="NEEDS_PARTS">Needs Parts</option>
              <option value="DOWN">Down</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60">
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editItem ? "Update" : "Add Machine"}
            </button>
            <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </SlideDrawer>

      <MaintenanceDrawer 
        isOpen={maintenanceDrawerOpen}
        onClose={() => setMaintenanceDrawerOpen(false)}
        machineId={selectedMachineId || undefined}
      />

      <MaintenanceHistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        machineId={selectedMachineId}
        machineName={selectedMachineName}
      />
    </div>
  );
}
