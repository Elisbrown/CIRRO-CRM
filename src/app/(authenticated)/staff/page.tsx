"use client";

import { useState } from "react";
import { useStaffList, useCreateStaff, useDeleteStaff, useStaffDetail, useUpdateStaff, useResetStaffPassword } from "@/hooks/use-data";
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
  Lock,
} from "lucide-react";

export default function StaffPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const { data, isLoading } = useStaffList({ page, search, limit: 25 });
  const { data: staffDetail, isLoading: isLoadingDetail } = useStaffDetail(selectedStaffId);
  const createMutation = useCreateStaff();
  const deleteMutation = useDeleteStaff();
  const updateMutation = useUpdateStaff(selectedStaffId || 0);
  const resetPasswordMutation = useResetStaffPassword();

  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "ADMIN",
      role: "STAFF",
      password: "",
    },
  });

  const editForm = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema) as any,
  });

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  async function handleCreate(data: CreateStaffInput) {
    const res = await createMutation.mutateAsync(data) as any;
    if (avatarFile && res.id) {
       const formData = new FormData();
       formData.append("file", avatarFile);
       formData.append("staffId", String(res.id));
       await fetch("/api/staff/upload", { method: "POST", body: formData });
    }
    setDrawerOpen(false);
    setAvatarFile(null);
    form.reset();
  }

  async function handleUpdate(data: CreateStaffInput) {
    if (!selectedStaffId) return;
    await updateMutation.mutateAsync(data as any);
    if (avatarFile) {
       const formData = new FormData();
       formData.append("file", avatarFile);
       formData.append("staffId", String(selectedStaffId));
       await fetch("/api/staff/upload", { method: "POST", body: formData });
    }
    setDetailDrawerOpen(false);
    setSelectedStaffId(null);
    setAvatarFile(null);
  }

  async function handleResetPassword() {
    if (!selectedStaffId || !newPassword) return;
    try {
      await resetPasswordMutation.mutateAsync({ staffId: selectedStaffId, newPassword });
      alert("Password has been reset successfully.");
      setResetModalOpen(false);
      setNewPassword("");
    } catch (e: any) {
      alert(e.message || "Failed to reset password");
    }
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
          onClick={() => {
            form.reset();
            setAvatarFile(null);
            setDrawerOpen(true);
          }}
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
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Employee
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Department
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                  onClick={() => {
                    setSelectedStaffId(s.id);
                    setDetailDrawerOpen(true);
                  }}
                  className="cursor-pointer transition-colors hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-blue-100 shadow-sm border border-black/5">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-blue-700">
                            {s.firstName[0]}{s.lastName[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">{s.staffId}</p>
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
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedStaffId(s.id);
                          setResetModalOpen(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
                        title="Reset Password"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                       <button
                        onClick={() => {
                          if (confirm("Deactivate this staff member?")) {
                            deleteMutation.mutate(s.id);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Deactivate"
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

      {/* Staff Detail Drawer */}
      <SlideDrawer
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedStaffId(null);
          setAvatarFile(null);
          editForm.reset();
        }}
        title="Staff Profile"
      >
        {isLoadingDetail || !staffDetail ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" />
                  ) : staffDetail.avatarUrl ? (
                    <img src={staffDetail.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-300">
                      {staffDetail.firstName[0]}{staffDetail.lastName[0]}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none">
                  <Plus className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{staffDetail.firstName} {staffDetail.lastName}</h2>
                <p className="text-sm text-gray-500">{staffDetail.staffId} • {staffDetail.email}</p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4">
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Assigned</p>
                  <p className="text-2xl font-black text-black">{staffDetail._count.assignedTasks}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Completed</p>
                  <p className="text-2xl font-black text-green-600">{staffDetail.completedTasksCount}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Rate</p>
                  <p className="text-2xl font-black text-blue-600">{staffDetail.performanceRate}%</p>
               </div>
            </div>

            {/* Quick Actions / CRUD */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-50 shadow-sm">
                   <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Department</p>
                   <p className="text-sm font-semibold">{staffDetail.department}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-50 shadow-sm">
                   <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Role</p>
                   <p className="text-sm font-semibold">{staffDetail.role}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-50 shadow-sm">
                   <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Phone</p>
                   <p className="text-sm font-semibold">{staffDetail.phone || "N/A"}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-50 shadow-sm">
                   <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Status</p>
                   <StatusBadge value={staffDetail.status} />
                </div>
              </div>
            </div>

            {/* Note: In a real app, you'd add an Edit Form here that populates with staffDetail */}
            <div className="pt-6 border-t border-gray-100 flex gap-3">
               <button
                 onClick={() => {
                   if (confirm("Save changes to profile and avatar?")) {
                      handleUpdate(staffDetail as any);
                   }
                 }}
                 disabled={updateMutation.isPending}
                 className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98] disabled:opacity-50"
               >
                 {updateMutation.isPending ? "Saving..." : "Save Profile Changes"}
               </button>
            </div>
          </div>
        )}
      </SlideDrawer>

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter a new password for this staff member.
            </p>
            <div className="mt-4">
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending || newPassword.length < 6}
                className="flex-1 rounded-xl bg-black py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-900 disabled:opacity-50"
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </button>
              <button
                onClick={() => {
                    setResetModalOpen(false);
                    setNewPassword("");
                }}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="flex flex-col items-center gap-4 py-6 border-b border-gray-100 mb-4 bg-gray-50/50 rounded-xl">
             <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
             </div>
             <p className="text-[10px] text-gray-500 font-medium uppercase">Profile Picture (Square preferred)</p>
          </div>
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
                <option value="STAFF">Staff</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="MANAGER">Manager</option>
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
