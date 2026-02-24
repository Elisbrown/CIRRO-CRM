import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { 
  CreateStaffInput, UpdateStaffInput, 
  CreateContactInput, UpdateContactInput,
  CreateServiceRequestInput, UpdateServiceRequestInput,
  CreateSupplierInput, UpdateSupplierInput,
  CreateCatalogInput, UpdateCatalogInput,
  CreateMachineInput, UpdateMachineInput,
  CreateTaskInput, UpdateTaskInput,
  CreateTaskCommentInput,
  CreateCleaningLogInput, UpdateCleaningLogInput,
  CreateMaintenanceLogInput, UpdateMaintenanceLogInput
} from "@/lib/validations";

/**
 * Common fetch wrapper with error handling.
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data;
}

// ─── Staff Hooks ────────────────────────────────────────

interface PaginatedResponse<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface StaffListItem {
  id: number;
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  department: string;
  role: string;
  status: string;
  createdAt: string;
}

interface StaffDetail extends StaffListItem {
  updatedAt: string;
  _count: {
    assignedContacts: number;
    assignedTasks: number;
    cleaningLogs: number;
  };
}

export function useStaffList(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  return useQuery<PaginatedResponse<StaffListItem>>({
    queryKey: ["staff", params],
    queryFn: () => apiFetch(`/api/staff?${qs}`),
  });
}

export function useStaffDetail(id: number | null) {
  return useQuery<StaffDetail>({
    queryKey: ["staff", id],
    queryFn: () => apiFetch(`/api/staff/${id}`),
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffInput) =>
      apiFetch("/api/staff", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useUpdateStaff(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStaffInput) =>
      apiFetch(`/api/staff/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/staff/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

// ─── Contacts Hooks ─────────────────────────────────────

interface ContactListItem {
  id: number;
  clientId: string;
  type: string;
  companyName: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  country: string | null;
  leadSource: string | null;
  status: string;
  createdAt: string;
  assignedRep: { id: number; firstName: string; lastName: string } | null;
}

interface ContactDetail extends ContactListItem {
  updatedAt: string;
  serviceRequests: Array<{
    id: number;
    requestId: string;
    businessUnit: string;
    status: string;
    finalAmount: number | null;
    createdAt: string;
  }>;
  activities: Array<{
    id: number;
    type: string;
    content: string;
    createdAt: string;
    staff: { firstName: string; lastName: string } | null;
  }>;
  _count: { serviceRequests: number; activities: number };
}

export function useContactsList(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.type) qs.set("type", params.type);
  if (params.status) qs.set("status", params.status);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  return useQuery<PaginatedResponse<ContactListItem>>({
    queryKey: ["contacts", params],
    queryFn: () => apiFetch(`/api/contacts?${qs}`),
  });
}

export function useContactDetail(id: number | null) {
  return useQuery<ContactDetail>({
    queryKey: ["contacts", id],
    queryFn: () => apiFetch(`/api/contacts/${id}`),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContactInput) =>
      apiFetch("/api/contacts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useUpdateContact(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateContactInput) =>
      apiFetch(`/api/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/contacts/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

// ─── Service Requests Hooks ─────────────────────────────

interface SRListItem {
  id: number;
  requestId: string;
  businessUnit: string;
  executionType: string;
  status: string;
  quotedAmount: number | null;
  finalAmount: number | null;
  supplyCost: number;
  outsourceCost: number;
  laborCost: number;
  notes: string | null;
  deliveryDate: string | null;
  createdAt: string;
  contact: { id: number; firstName: string; lastName: string; companyName: string | null; clientId: string };
  service: { id: number; serviceName: string } | null;
  machine: { id: number; name: string } | null;
  supplier: { id: number; name: string } | null;
}

export function useServiceRequestsList(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  businessUnit?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.businessUnit) qs.set("businessUnit", params.businessUnit);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  return useQuery<PaginatedResponse<SRListItem>>({
    queryKey: ["service-requests", params],
    queryFn: () => apiFetch(`/api/service-requests?${qs}`),
  });
}

export function useServiceRequestDetail(id: number | null) {
  return useQuery({
    queryKey: ["service-requests", id],
    queryFn: () => apiFetch<SRListItem & { netProfit: number }>(`/api/service-requests/${id}`),
    enabled: !!id,
  });
}

export function useCreateServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceRequestInput) =>
      apiFetch("/api/service-requests", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-requests"] }),
  });
}

export function useUpdateServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceRequestInput }) =>
      apiFetch(`/api/service-requests/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["service-requests"] });
      qc.invalidateQueries({ queryKey: ["service-requests", variables.id] });
    },
  });
}

export function useDeleteServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/service-requests/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-requests"] }),
  });
}

// ─── Lookup Hooks (Catalog, Machines, Contacts for dropdowns) ───

export function useCatalogList() {
  return useQuery<Array<{ id: number; serviceName: string; businessUnit: string; basePrice: number }>>({
    queryKey: ["catalog"],
    queryFn: () => apiFetch("/api/catalog"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMachinesList() {
  return useQuery<Array<{ id: number; name: string; model: string | null; status: string }>>({
    queryKey: ["machines"],
    queryFn: () => apiFetch("/api/machines"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useContactsLookup() {
  return useQuery<Array<{ id: number; firstName: string; lastName: string; companyName: string | null }>>({
    queryKey: ["contacts-lookup"],
    queryFn: () => apiFetch("/api/contacts/lookup"),
    staleTime: 2 * 60 * 1000,
  });
}

export function useStaffLookup() {
  return useQuery<Array<{ id: number; firstName: string; lastName: string; department: string }>>({
    queryKey: ["staff-lookup"],
    queryFn: () => apiFetch("/api/staff/lookup"),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, serviceRequestId }: { file: File; serviceRequestId: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serviceRequestId", String(serviceRequestId));
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attachments"] }),
  });
}

export function useAttachments(serviceRequestId: number | null) {
  return useQuery({
    queryKey: ["attachments", serviceRequestId],
    queryFn: () => apiFetch(`/api/uploads?serviceRequestId=${serviceRequestId}`),
    enabled: !!serviceRequestId,
  });
}

// ─── Suppliers Hooks ────────────────────────────────────

interface SupplierListItem {
  id: number;
  name: string;
  category: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

export function useSuppliersList(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.category) qs.set("category", params.category);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  return useQuery<PaginatedResponse<SupplierListItem>>({
    queryKey: ["suppliers", params],
    queryFn: () => apiFetch(`/api/suppliers?${qs}`),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierInput) =>
      apiFetch("/api/suppliers", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSupplierInput) =>
      apiFetch(`/api/suppliers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/suppliers/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useSuppliersLookup() {
  return useQuery<Array<{ id: number; name: string; category: string }>>({
    queryKey: ["suppliers-lookup"],
    queryFn: () => apiFetch("/api/suppliers/lookup"),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Tasks Hooks ────────────────────────────────────────

interface TaskListItem {
  id: number;
  title: string;
  description: string | null;
  assignedTo: number | null;
  priority: string;
  status: string;
  dueDate: string | null;
  relatedRecordId: number | null;
  relatedType: string | null;
  createdAt: string;
  assignee: { id: number; firstName: string; lastName: string } | null;
  _count: { comments: number };
}

interface TaskComment {
  id: number;
  taskId: number;
  authorId: number;
  content: string;
  createdAt: string;
}

interface TaskDetail extends TaskListItem {
  comments: TaskComment[];
}

export function useTasksList(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assignedTo?: number;
  relatedRecordId?: number;
  relatedType?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.assignedTo) qs.set("assignedTo", String(params.assignedTo));
  if (params.relatedRecordId) qs.set("relatedRecordId", String(params.relatedRecordId));
  if (params.relatedType) qs.set("relatedType", params.relatedType);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  return useQuery<PaginatedResponse<TaskListItem>>({
    queryKey: ["tasks", params],
    queryFn: () => apiFetch(`/api/tasks?${qs}`),
  });
}

export function useTaskDetail(id: number | null) {
  return useQuery<TaskDetail>({
    queryKey: ["tasks", id],
    queryFn: () => apiFetch(`/api/tasks/${id}`),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskInput) =>
      apiFetch(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["tasks", id] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCreateTaskComment(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskCommentInput) =>
      apiFetch(`/api/tasks/${taskId}/comments`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
}

// ─── Dashboard Hooks ────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<any>("/api/dashboard/stats"),
    staleTime: 60 * 1000, // 1 minute cache
  });
}

// ─── Cleaning Logs Hooks ────────────────────────────────

interface CleaningLogListItem {
  id: number;
  staffId: number;
  zone: string;
  result: string;
  grade: number;
  deduction: number;
  inspectorNotes: string | null;
  createdAt: string;
  cleaner: { id: number; firstName: string; lastName: string };
}

export function useCleaningLogsList(params: {
  page?: number;
  limit?: number;
  zone?: string;
  staffId?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.zone) qs.set("zone", params.zone);
  if (params.staffId) qs.set("staffId", String(params.staffId));
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  return useQuery<PaginatedResponse<CleaningLogListItem>>({
    queryKey: ["cleaning-logs", params],
    queryFn: () => apiFetch(`/api/cleaning?${qs}`),
  });
}

export function useCreateCleaningLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCleaningLogInput) =>
      apiFetch("/api/cleaning", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cleaning-logs"] }),
  });
}

export function useUpdateCleaningLog(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCleaningLogInput) =>
      apiFetch(`/api/cleaning/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaning-logs"] });
      qc.invalidateQueries({ queryKey: ["cleaning-logs", id] });
    },
  });
}

export function useDeleteCleaningLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/cleaning/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cleaning-logs"] }),
  });
}

// ─── Maintenance Logs Hooks ─────────────────────────────

interface MaintenanceLogListItem {
  id: number;
  machineId: number;
  action: string;
  cost: number;
  status: string;
  createdAt: string;
  machine: { id: number; name: string };
}

export function useMaintenanceLogsList(params: {
  page?: number;
  limit?: number;
  machineId?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.machineId) qs.set("machineId", String(params.machineId));
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  return useQuery<PaginatedResponse<MaintenanceLogListItem>>({
    queryKey: ["maintenance-logs", params],
    queryFn: () => apiFetch(`/api/maintenance?${qs}`),
  });
}

export function useCreateMaintenanceLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenanceLogInput) =>
      apiFetch("/api/maintenance", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance-logs"] });
      qc.invalidateQueries({ queryKey: ["machines"] });
    },
  });
}

export function useUpdateMaintenanceLog(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMaintenanceLogInput) =>
      apiFetch(`/api/maintenance/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance-logs"] });
      qc.invalidateQueries({ queryKey: ["machines"] });
    },
  });
}

export function useDeleteMaintenanceLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/maintenance/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance-logs"] }),
  });
}
