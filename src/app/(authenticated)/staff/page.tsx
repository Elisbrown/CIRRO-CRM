"use client";

import { useState } from "react";
import { useStaffList, useCreateStaff, useDeleteStaff } from "@/hooks/use-data";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStaffSchema, type CreateStaffInput } from "@/lib/validations";
import {
  Plus,
  Search,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Loader2,
} from "lucide-react";

export default function StaffPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useStaffList({ page, search, limit: 25 });
  const createMutation = useCreateStaff();
  const deleteMutation = useDeleteStaff();

  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "ADMIN",
      role: "ASSISTANT",
      password: "",
    },
  });

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  async function handleCreate(data: CreateStaffInput) {
    await createMutation.mutateAsync(data);
    setDrawerOpen(false);
    form.reset();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage team members and their access roles
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
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
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                </td>
              </tr>
            ) : !data?.items.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  No staff members found
                </td>
              </tr>
            ) : (
              data.items.map((s) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{s.staffId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={s.department} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={s.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm("Deactivate this staff member?")) {
                          deleteMutation.mutate(s.id);
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Deactivate"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
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

      {/* Create Staff Drawer */}
      <SlideDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.reset();
        }}
        title="Add Staff Member"
      >
        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" error={form.formState.errors.firstName?.message}>
              <input {...form.register("firstName")} className="form-input" placeholder="John" />
            </FormField>
            <FormField label="Last Name" error={form.formState.errors.lastName?.message}>
              <input {...form.register("lastName")} className="form-input" placeholder="Doe" />
            </FormField>
          </div>

          <FormField label="Email" error={form.formState.errors.email?.message}>
            <input {...form.register("email")} type="email" className="form-input" placeholder="john@cirronyx.com" />
          </FormField>

          <FormField label="Phone" error={form.formState.errors.phone?.message}>
            <input {...form.register("phone")} className="form-input" placeholder="+237 6XX XXX XXX" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department" error={form.formState.errors.department?.message}>
              <select {...form.register("department")} className="form-input">
                <option value="ADMIN">Admin</option>
                <option value="JOYSUN">Joysun Printing</option>
                <option value="OFFIZONE">Offizone Coworking</option>
              </select>
            </FormField>
            <FormField label="Role" error={form.formState.errors.role?.message}>
              <select {...form.register("role")} className="form-input">
                <option value="ASSISTANT">Assistant</option>
                <option value="SALES_REP">Sales Rep</option>
                <option value="OPERATIONS_MANAGER">Ops Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </FormField>
          </div>

          <FormField label="Password" error={form.formState.errors.password?.message}>
            <input {...form.register("password")} type="password" className="form-input" placeholder="Min 6 characters" />
          </FormField>

          {createMutation.error && (
            <p className="text-sm text-red-600">{createMutation.error.message}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                form.reset();
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </SlideDrawer>
    </div>
  );
}

/* ─── Inline Form Field ────────────────────────────────── */

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
