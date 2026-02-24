"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { Plus, Search, Loader2, Trash2, Edit3 } from "lucide-react";

function apiFetch(url: string, opts?: RequestInit) {
  return fetch(url, { headers: { "Content-Type": "application/json" }, ...opts }).then(async (r) => {
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
  });
}

interface CatalogItem {
  id: number;
  serviceName: string;
  businessUnit: string;
  basePrice: number;
  _count?: { serviceRequests: number };
}

export default function CatalogPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [buFilter, setBuFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<CatalogItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["catalog-admin", { page, search, buFilter }],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), limit: "25" });
      if (search) qs.set("search", search);
      if (buFilter) qs.set("businessUnit", buFilter);
      return apiFetch(`/api/catalog?${qs}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => apiFetch("/api/catalog", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog-admin"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: Record<string, unknown>) => apiFetch(`/api/catalog/${id}`, { method: "PUT", body: JSON.stringify(d) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog-admin"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/catalog/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog-admin"] }),
  });

  const [formData, setFormData] = useState({ serviceName: "", businessUnit: "JOYSUN", basePrice: "" });

  function openCreate() {
    setEditItem(null);
    setFormData({ serviceName: "", businessUnit: "JOYSUN", basePrice: "" });
    setDrawerOpen(true);
  }

  function openEdit(item: CatalogItem) {
    setEditItem(item);
    setFormData({ serviceName: item.serviceName, businessUnit: item.businessUnit, basePrice: String(item.basePrice) });
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      serviceName: formData.serviceName,
      businessUnit: formData.businessUnit,
      basePrice: parseFloat(formData.basePrice) || 0,
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
          <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">Manage available services and pricing</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <select value={buFilter} onChange={(e) => { setBuFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
          <option value="">All Units</option>
          <option value="JOYSUN">Joysun</option>
          <option value="OFFIZONE">Offizone</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Service Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Business Unit</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Base Price</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Requests</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></td></tr>
              ) : !data?.items?.length ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No catalog entries found</td></tr>
              ) : (
                data.items.map((item: CatalogItem) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.serviceName}</td>
                    <td className="px-4 py-3"><StatusBadge value={item.businessUnit} /></td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">XAF {Number(item.basePrice).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{item._count?.serviceRequests ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-blue-500">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => { if (confirm("Delete this service?")) deleteMutation.mutate(item.id); }} className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500">
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

      <SlideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editItem ? "Edit Service" : "Add Service"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Service Name *</label>
            <input name="serviceName" value={formData.serviceName} onChange={(e) => setFormData(p => ({ ...p, serviceName: e.target.value }))} required className="form-input" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Business Unit *</label>
            <select name="businessUnit" value={formData.businessUnit} onChange={(e) => setFormData(p => ({ ...p, businessUnit: e.target.value }))} className="form-input">
              <option value="JOYSUN">Joysun</option>
              <option value="OFFIZONE">Offizone</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Base Price (XAF) *</label>
            <input type="number" step="0.01" value={formData.basePrice} onChange={(e) => setFormData(p => ({ ...p, basePrice: e.target.value }))} required className="form-input" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60">
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editItem ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </SlideDrawer>
    </div>
  );
}
