import { z } from "zod";

// ─── Staff Schemas ──────────────────────────────────────

export const createStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.enum(["OFFIZONE", "JOYSUN", "ADMIN"]),
  role: z.enum(["MANAGER", "ACCOUNTANT", "STAFF"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateStaffSchema = createStaffSchema
  .omit({ password: true })
  .partial()
  .extend({
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    password: z.string().min(6).optional(),
    avatarUrl: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  });

/** Schema for staff self-service profile updates. */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
});

// ─── Contact Schemas ────────────────────────────────────

export const createContactSchema = z.object({
  type: z.enum(["LEAD", "CUSTOMER"]).default("LEAD"),
  companyName: z.string().optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  country: z.string().optional(),
  leadSource: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).default("NEW"),
  assignedTo: z.number().int().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateContactSchema = createContactSchema.partial();

// ─── Service Request Schemas ────────────────────────────

export const createServiceRequestSchema = z.object({
  contactId: z.number().int().positive("Contact is required"),
  businessUnit: z.enum(["OFFIZONE", "JOYSUN"]),
  serviceId: z.number().int().positive().optional().nullable(),
  executionType: z.enum(["IN_HOUSE", "OUTSOURCED", "HYBRID"]).default("IN_HOUSE"),
  machineId: z.number().int().positive().optional().nullable(),
  supplierId: z.number().int().positive().optional().nullable(),
  referralId: z.number().int().positive().optional().nullable(),
  referralType: z.enum(["STAFF", "CONTACT"]).optional().nullable(),
  assignedToStaffId: z.number().int().positive().optional().nullable(),
  quotedAmount: z.number().nonnegative().optional().nullable(),
  finalAmount: z.number().nonnegative().optional().nullable(),
  supplyCost: z.number().nonnegative().default(0),
  outsourceCost: z.number().nonnegative().default(0),
  laborCost: z.number().nonnegative().default(0),
  status: z.enum(["DRAFT", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELED"]).default("DRAFT"),
  notes: z.string().optional(),
  deliveryDate: z.string().optional().nullable(),
  // Print job fields
  paperSize: z.string().optional().nullable(),
  colorMode: z.string().optional().nullable(),
  quantity: z.number().int().positive().optional().nullable(),
  finishType: z.string().optional().nullable(),
});

export const updateServiceRequestSchema = createServiceRequestSchema.partial();

// ─── Supplier Schemas ───────────────────────────────────

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.enum([
    "RAW_MATERIALS", "PRINTING_PARTNER", "MAINTENANCE", "CLEANING_SUPPLIES",
    "PLUMBER", "CARPENTRY", "ELECTRICITY", "PAINTING", "HVAC",
    "SECURITY", "IT_SERVICES", "OTHER",
  ]),
  contactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  bankDetails: z.string().optional().nullable(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

// ─── Catalog Schemas ────────────────────────────────────

export const createCatalogSchema = z.object({
  businessUnit: z.enum(["OFFIZONE", "JOYSUN"]),
  serviceName: z.string().min(1, "Service name is required").max(200),
  basePrice: z.number().nonnegative("Price must be >= 0"),
});

export const updateCatalogSchema = createCatalogSchema.partial();

// ─── Machine Schemas ────────────────────────────────────

export const createMachineSchema = z.object({
  name: z.string().min(1, "Machine name is required").max(200),
  model: z.string().optional().nullable(),
  status: z.enum(["OPERATIONAL", "NEEDS_PARTS", "DOWN"]).default("OPERATIONAL"),
});

export const updateMachineSchema = createMachineSchema.partial().extend({
  lastMaintenanceDate: z.string().optional().nullable(),
});

// ─── Task Schemas ───────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().nullable(),
  assignedTo: z.number().int().positive().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "DOING", "BLOCKED", "PENDING_APPROVAL", "DONE"]).default("TODO"),
  dueDate: z.string().optional().nullable(), // Expected: YYYY-MM-DDTHH:mm
  isGeneral: z.boolean().default(false),
  relatedRecordId: z.number().int().positive().optional().nullable(),
  relatedType: z.enum(["Contact", "ServiceRequest"]).optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional().nullable(),
  recurringDays: z.number().int().positive().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const createTaskCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
});

// ─── Sub-Task Schemas ───────────────────────────────────

export const createSubTaskSchema = z.object({
  title: z.string().min(1, "Sub-task title is required").max(200),
  isCompleted: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateSubTaskSchema = createSubTaskSchema.partial();


// ─── Maintenance Log Schemas ────────────────────────────

export const createMaintenanceLogSchema = z.object({
  machineId: z.number().int().positive("Machine is required"),
  action: z.string().min(1, "Maintenance action description is required"),
  cost: z.number().nonnegative().default(0),
  status: z.enum(["OPERATIONAL", "NEEDS_PARTS", "DOWN"]).default("OPERATIONAL"),
});

export const updateMaintenanceLogSchema = createMaintenanceLogSchema.partial();

// ─── Rental Space Schemas ───────────────────────────────

export const createRentalSpaceSchema = z.object({
  name: z.string().min(1, "Space name is required").max(200),
  type: z.string().min(1, "Space type is required"),
  location: z.string().optional().nullable(),
  monthlyRent: z.number().nonnegative("Monthly rent must be >= 0"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "UNDER_MAINTENANCE"]).default("AVAILABLE"),
  tenantName: z.string().optional().nullable(),
  tenantPhone: z.string().optional().nullable(),
  tenantEmail: z.string().email().optional().or(z.literal("")).nullable(),
  notes: z.string().optional().nullable(),
});

export const updateRentalSpaceSchema = createRentalSpaceSchema.partial();

// ─── Rent Payment Schemas ───────────────────────────────

export const createRentPaymentSchema = z.object({
  spaceId: z.number().int().positive("Space is required"),
  amount: z.number().nonnegative("Amount must be >= 0"),
  paidAt: z.string().min(1, "Payment date is required"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  paymentMethod: z.string().optional().nullable(),
  receiptNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateRentPaymentSchema = createRentPaymentSchema.partial();

// ─── Contact Attachment Schemas ─────────────────────────

export const createContactAttachmentSchema = z.object({
  contactId: z.number().int().positive("Contact is required"),
  type: z.enum(["NOTE", "FILE"]).default("NOTE"),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
});

// ─── Type Exports ───────────────────────────────────────

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateCatalogInput = z.infer<typeof createCatalogSchema>;
export type UpdateCatalogInput = z.infer<typeof updateCatalogSchema>;
export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateTaskCommentInput = z.infer<typeof createTaskCommentSchema>;
export type CreateSubTaskInput = z.infer<typeof createSubTaskSchema>;
export type UpdateSubTaskInput = z.infer<typeof updateSubTaskSchema>;
export type CreateMaintenanceLogInput = z.infer<typeof createMaintenanceLogSchema>;
export type UpdateMaintenanceLogInput = z.infer<typeof updateMaintenanceLogSchema>;
export type CreateRentalSpaceInput = z.infer<typeof createRentalSpaceSchema>;
export type UpdateRentalSpaceInput = z.infer<typeof updateRentalSpaceSchema>;
export type CreateRentPaymentInput = z.infer<typeof createRentPaymentSchema>;
export type UpdateRentPaymentInput = z.infer<typeof updateRentPaymentSchema>;
export type CreateContactAttachmentInput = z.infer<typeof createContactAttachmentSchema>;
