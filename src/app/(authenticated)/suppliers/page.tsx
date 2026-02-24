"use client";

import { useState } from "react";
import {
  useSuppliersList,
  useCreateSupplier,
  useDeleteSupplier,
} from "@/hooks/use-data";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { Plus, Search, Loader2, Trash2 } from "lucide-react";

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useSuppliersList({
    page,
    search,
    category: categoryFilter || undefined,
    limit: 25,
  });

  const createMutation = useCreateSupplier();
  const deleteMutation = useDeleteSupplier();

  const [formData, setFormData] = useState({
    name: "",
    category: "RAW_MATERIALS",
    contactName: "",
    phone: "",
    email: "",
    bankDetails: "",
  });

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createMutation.mutateAsync({
      name: formData.name,
      category: formData.category as any,
      contactName: formData.contactName || null,
      phone: formData.phone || null,
      email: formData.email || null,
      bankDetails: formData.bankDetails || null,
    });
    setDrawerOpen(false);
    setFormData({ name: "", category: "RAW_MATERIALS", contactName: "", phone: "", email: "", bankDetails: "" });
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-sm text-gray-500">Manage vendors and outsourcing partners</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900">
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All Categories</option>
          <option value="RAW_MATERIALS">Raw Materials</option>
          <option value="PRINTING_PARTNER">Printing Partner</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="CLEANING_SUPPLIES">Cleaning Supplies</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Jobs</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></td></tr>
              ) : !data?.items.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No suppliers found</td></tr>
              ) : (
              data.items.map((s: { id: number; name: string; email: string | null; category: string; contactName: string | null; phone: string | null; _count?: { serviceRequests: number } }) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      {s.email && <p className="text-xs text-gray-400">{s.email}</p>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge value={s.category} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.contactName || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.phone || "—"}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                      {s._count?.serviceRequests ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { if (confirm("Delete this supplier?")) deleteMutation.mutate(s.id as number); }}
                        className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

      <SlideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Supplier">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Supplier Name *</label>
            <input name="name" value={formData.name} onChange={onChange} required className="form-input" placeholder="e.g. PrintPro Cameroon" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Category *</label>
            <select name="category" value={formData.category} onChange={onChange} className="form-input">
              <option value="RAW_MATERIALS">Raw Materials</option>
              <option value="PRINTING_PARTNER">Printing Partner</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="CLEANING_SUPPLIES">Cleaning Supplies</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Contact Person</label>
              <input name="contactName" value={formData.contactName} onChange={onChange} className="form-input" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" value={formData.phone} onChange={onChange} className="form-input" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" value={formData.email} onChange={onChange} className="form-input" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Bank / Payment Details</label>
            <textarea name="bankDetails" rows={2} value={formData.bankDetails} onChange={onChange} className="form-input" placeholder="MoMo, bank account, etc." />
          </div>
          {createMutation.error && <p className="text-sm text-red-600">{createMutation.error.message}</p>}
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={createMutation.isPending} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60">
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Supplier
            </button>
            <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </SlideDrawer>
    </div>
  );
}
