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
  CreateSubTaskInput, UpdateSubTaskInput,
  CreateMaintenanceLogInput, UpdateMaintenanceLogInput,
  CreateRentalSpaceInput, UpdateRentalSpaceInput,
  CreateRentPaymentInput,
  CreateContactAttachmentInput,
  UpdateProfileInput,
} from "@/lib/validations";

/**
 * Common fetch wrapper with error handling.
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    const snippet = text.slice(0, 100).replace(/<[^>]*>/g, "").trim();
    console.error(`[API Error] ${res.status} Expected JSON, got ${contentType}:`, text.slice(0, 200));
    throw new Error(`Server error (${res.status}): ${snippet || "Invalid response format"}`);
  }

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
  avatarUrl: string | null;
  createdAt: string;
}

interface StaffDetail extends StaffListItem {
  updatedAt: string;
  avatarUrl: string | null;
  bio: string | null;
  address: string | null;
  completedTasksCount: number;
  performanceRate: number;
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
  notes: string | null;
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

// ─── Lookup Hooks ───────────────────────────────────────

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
  isRecurring: boolean;
  createdAt: string;
  assignee: { id: number; firstName: string; lastName: string } | null;
  creator: { id: number; firstName: string; lastName: string } | null;
  _count: { comments: number; subTasks: number; attachments: number };
}

interface TaskComment {
  id: number;
  taskId: number;
  authorId: number;
  content: string;
  createdAt: string;
  author: { firstName: string; lastName: string } | null;
}

interface TaskDetail extends TaskListItem {
  approvedById: number | null;
  approvedAt: string | null;
  completedAt: string | null;
  recurringInterval: string | null;
  recurringDays: number | null;
  approver: { id: number; firstName: string; lastName: string } | null;
  comments: TaskComment[];
  subTasks: Array<{ id: number; taskId: number; title: string; isCompleted: boolean; sortOrder: number }>;
  attachments: Array<{
    id: number; fileName: string; fileUrl: string; fileSize: number; mimeType: string;
    uploadedBy: { id: number; firstName: string; lastName: string } | null;
    createdAt: string;
  }>;
  logs: Array<{
    id: number; action: string; details: string | null; createdAt: string;
    performedBy: { id: number; firstName: string; lastName: string } | null;
  }>;
}

export function useTasksList(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
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
  if (params.priority) qs.set("priority", params.priority);
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

// ─── Sub-Tasks Hooks ────────────────────────────────────

export function useCreateSubTask(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubTaskInput) =>
      apiFetch(`/api/tasks/${taskId}/subtasks`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", taskId] }),
  });
}

export function useUpdateSubTask(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSubTaskInput & { subtaskId: number }) =>
      apiFetch(`/api/tasks/${taskId}/subtasks`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", taskId] }),
  });
}

export function useDeleteSubTask(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subtaskId: number) =>
      apiFetch(`/api/tasks/${taskId}/subtasks?subtaskId=${subtaskId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", taskId] }),
  });
}

// ─── Task Attachments Hooks ─────────────────────────────
export function useUploadTaskAttachment(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const CHUNK_SIZE = 512 * 1024; // 512KB
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      let lastResponse: any = null;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", new File([chunk], file.name, { type: file.type }));
        formData.append("chunkIndex", i.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("fileName", file.name);
        formData.append("taskId", taskId.toString());
        formData.append("uploadId", uploadId);

        const res = await fetch(`/api/uploads/chunk`, { method: "POST", body: formData });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          const snippet = text.slice(0, 100).replace(/<[^>]*>/g, "").trim();
          throw new Error(`Upload failed (${res.status}): ${snippet || "Invalid server response"}`);
        }

        const json = await res.json();
        if (!json.success) throw new Error(json.error || `Chunk ${i + 1}/${totalChunks} failed`);

        lastResponse = json.data;
      }

      return lastResponse;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", taskId] }),
  });
}

export function useDeleteTaskAttachment(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) =>
      apiFetch(`/api/tasks/${taskId}/attachments?attachmentId=${attachmentId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", taskId] }),
  });
}

// ─── Dashboard Hooks ────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<any>("/api/dashboard/stats"),
    staleTime: 60 * 1000,
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

// ─── Rent Hooks ─────────────────────────────────────────

export function useRentalSpaces(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  return useQuery<PaginatedResponse<any>>({
    queryKey: ["rental-spaces", params],
    queryFn: () => apiFetch(`/api/rent/spaces?${qs}`),
  });
}

export function useRentalSpaceDetail(id: number | null) {
  return useQuery({
    queryKey: ["rental-spaces", id],
    queryFn: () => apiFetch(`/api/rent/spaces/${id}`),
    enabled: !!id,
  });
}

export function useCreateRentalSpace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRentalSpaceInput) =>
      apiFetch("/api/rent/spaces", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rental-spaces"] }),
  });
}

export function useUpdateRentalSpace(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRentalSpaceInput) =>
      apiFetch(`/api/rent/spaces/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rental-spaces"] }),
  });
}

export function useDeleteRentalSpace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/rent/spaces/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rental-spaces"] }),
  });
}

export function useRentPayments(params: { spaceId?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params.spaceId) qs.set("spaceId", String(params.spaceId));
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));

  return useQuery<PaginatedResponse<any>>({
    queryKey: ["rent-payments", params],
    queryFn: () => apiFetch(`/api/rent/payments?${qs}`),
  });
}

export function useCreateRentPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRentPaymentInput) =>
      apiFetch("/api/rent/payments", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rent-payments"] });
      qc.invalidateQueries({ queryKey: ["rental-spaces"] });
    },
  });
}

// ─── Staff Performance Hook ────────────────────────────

export function useStaffPerformance() {
  return useQuery<any[]>({
    queryKey: ["staff-performance"],
    queryFn: () => apiFetch("/api/staff/performance"),
    staleTime: 60 * 1000,
  });
}

// ─── Profile Hooks ──────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<any>("/api/profile"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiFetch("/api/profile", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// ─── Contact Attachments Hooks ──────────────────────────

export function useContactAttachments(contactId: number | null) {
  return useQuery<any[]>({
    queryKey: ["contact-attachments", contactId],
    queryFn: () => apiFetch(`/api/contacts/${contactId}/attachments`),
    enabled: !!contactId,
  });
}

export function useCreateContactNote(contactId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContactAttachmentInput) =>
      apiFetch(`/api/contacts/${contactId}/attachments`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-attachments", contactId] }),
  });
}

export function useUploadContactFile(contactId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      const res = await fetch(`/api/contacts/${contactId}/attachments`, { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-attachments", contactId] }),
  });
}

export function useDeleteContactAttachment(contactId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) =>
      apiFetch(`/api/contacts/${contactId}/attachments?attachmentId=${attachmentId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-attachments", contactId] }),
  });
}
