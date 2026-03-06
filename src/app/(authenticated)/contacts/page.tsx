"use client";

import { useState } from "react";
import { useContactsList, useCreateContact, useUpdateContact, useDeleteContact, useStaffLookup } from "@/hooks/use-data";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { ContactDetailDrawer } from "@/components/contacts/ContactDetailDrawer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContactSchema } from "@/lib/validations";
import type { z } from "zod";
import {
  Plus,
  Search,
  UserPlus,
  Loader2,
  Trash2,
  Filter,
  Edit,
  Save,
} from "lucide-react";

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  const { data, isLoading } = useContactsList({
    page,
    search,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    limit: 25,
  });

  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact(editingContact?.id);
  const deleteMutation = useDeleteContact();
  const { data: staff } = useStaffLookup();

  const form = useForm<z.infer<typeof createContactSchema>>({
    resolver: zodResolver(createContactSchema) as any,
    defaultValues: {
      type: "LEAD",
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      leadSource: "",
      status: "NEW",
      notes: "",
    },
  });

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function handleOpenCreate() {
    setEditingContact(null);
    form.reset({
      type: "LEAD",
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      leadSource: "",
      status: "NEW",
      notes: "",
    });
    setDrawerOpen(true);
  }

  function handleOpenEdit(contact: any) {
    setEditingContact(contact);
    form.reset({
      type: contact.type || "LEAD",
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      companyName: contact.companyName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      city: contact.city || "",
      country: contact.country || "",
      leadSource: contact.leadSource || "",
      status: contact.status || "NEW",
      assignedTo: contact.assignedTo || undefined,
      notes: contact.notes || "",
    });
    setDrawerOpen(true);
  }

  async function handleSave(data: any) {
    try {
      if (editingContact) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      setDrawerOpen(false);
      setEditingContact(null);
      form.reset();
    } catch (error) {
      console.error("Failed to save contact:", error);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage leads, customers, and their interactions
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All Types</option>
          <option value="LEAD">Leads</option>
          <option value="CUSTOMER">Customers</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All Status</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
        <button
          onClick={handleSearch}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Location
              </th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                </td>
              </tr>
            ) : !data?.items.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  No contacts found
                </td>
              </tr>
            ) : (
              data.items.map((c) => (
                <tr key={c.id} className="cursor-pointer transition-colors hover:bg-gray-50/60" onClick={() => setSelectedContactId(c.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{c.email || c.phone || c.clientId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.companyName || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={c.type} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={c.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.assignedRep
                      ? `${c.assignedRep.firstName} ${c.assignedRep.lastName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {[c.city, c.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(c);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this contact?")) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data?.pagination && data.pagination.total > 0 && (
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            limit={data.pagination.limit}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Create/Edit Contact Drawer */}
      <SlideDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingContact(null);
          form.reset();
        }}
        title={editingContact ? "Edit Contact" : "Add Contact"}
      >
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Type" error={form.formState.errors.type?.message}>
              <select {...form.register("type")} className="form-input">
                <option value="LEAD">Lead</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </FormField>
            <FormField label="Assigned Rep" error={form.formState.errors.assignedTo?.message}>
              <select {...form.register("assignedTo", { valueAsNumber: true })} className="form-input">
                <option value="">Unassigned</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" error={form.formState.errors.firstName?.message}>
              <input {...form.register("firstName")} className="form-input" placeholder="Jane" />
            </FormField>
            <FormField label="Last Name" error={form.formState.errors.lastName?.message}>
              <input {...form.register("lastName")} className="form-input" placeholder="Smith" />
            </FormField>
          </div>

          <FormField label="Company" error={form.formState.errors.companyName?.message}>
            <input {...form.register("companyName")} className="form-input" placeholder="Acme Corp" />
          </FormField>

          <FormField label="Email" error={form.formState.errors.email?.message}>
            <input {...form.register("email")} type="email" className="form-input" placeholder="jane@acme.com" />
          </FormField>

          <FormField label="Phone" error={form.formState.errors.phone?.message}>
            <input {...form.register("phone")} className="form-input" placeholder="+237 6XX XXX XXX" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="City" error={form.formState.errors.city?.message}>
              <input {...form.register("city")} className="form-input" placeholder="Douala" />
            </FormField>
            <FormField label="Country" error={form.formState.errors.country?.message}>
              <input {...form.register("country")} className="form-input" placeholder="Cameroon" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Lead Source" error={form.formState.errors.leadSource?.message}>
              <select {...form.register("leadSource")} className="form-input">
                <option value="">Select...</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Social Media">Social Media</option>
                <option value="Phone">Phone</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
            <FormField label="Status" error={form.formState.errors.status?.message}>
              <select {...form.register("status")} className="form-input">
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </FormField>
          </div>
          <FormField label="Notes" error={form.formState.errors.notes?.message}>
            <textarea {...form.register("notes")} className="form-input h-24 resize-none" placeholder="Brief notes about this contact..." />
          </FormField>

          {(createMutation.error || updateMutation.error) && (
            <p className="text-sm text-red-600">{(createMutation.error || updateMutation.error)?.message}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:opacity-60"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingContact ? (
                <Save className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {editingContact ? "Save Changes" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                setEditingContact(null);
                form.reset();
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </SlideDrawer>

      {/* Contact Detail Drawer */}
      <ContactDetailDrawer
        contactId={selectedContactId}
        open={selectedContactId !== null}
        onClose={() => setSelectedContactId(null)}
      />
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
