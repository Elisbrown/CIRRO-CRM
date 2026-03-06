"use client";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-black text-white border-black",
  INACTIVE: "bg-gray-100 text-gray-500 border-gray-200",
  NEW: "bg-gray-50 text-gray-900 border-gray-200",
  CONTACTED: "bg-gray-200 text-gray-900 border-gray-300",
  QUALIFIED: "bg-gray-800 text-white border-gray-900",
  CONVERTED: "bg-black text-white border-black",
  LOST: "bg-white text-gray-400 border-gray-200",
  LEAD: "bg-gray-50 text-gray-700 border-gray-200",
  CUSTOMER: "bg-gray-900 text-white border-black",
  SUPER_ADMIN: "bg-black text-white border-black",
  OPERATIONS_MANAGER: "bg-gray-800 text-white border-gray-900",
  SALES_REP: "bg-gray-600 text-white border-gray-700",
  ASSISTANT: "bg-gray-100 text-gray-800 border-gray-200",
  // Service Request statuses
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  APPROVED: "bg-gray-200 text-gray-900 border-gray-300",
  IN_PROGRESS: "bg-gray-700 text-white border-gray-800",
  COMPLETED: "bg-black text-white border-black",
  CANCELED: "bg-white text-red-500 border-red-100",
  // Business units
  OFFIZONE: "bg-gray-100 text-gray-800 border-gray-300",
  JOYSUN: "bg-black text-white border-black",
  ADMIN: "bg-black text-white border-black",
  // Task statuses
  TODO: "bg-gray-100 text-gray-600 border-gray-200",
  DOING: "bg-gray-800 text-white border-gray-900",
  BLOCKED: "bg-red-50 text-red-600 border-red-100",
  DONE: "bg-black text-white border-black",
  // Machine statuses
  OPERATIONAL: "bg-black text-white border-black",
  NEEDS_PARTS: "bg-gray-400 text-white border-gray-500",
  DOWN: "bg-red-600 text-white border-red-700",
  // Supplier categories
  RAW_MATERIALS: "bg-gray-100 text-gray-800 border-gray-200",
  PRINTING_PARTNER: "bg-gray-900 text-white border-black",
  MAINTENANCE: "bg-gray-100 text-gray-700 border-gray-200",
  CLEANING_SUPPLIES: "bg-gray-50 text-gray-700 border-gray-200",
  PLUMBER: "bg-blue-50 text-blue-700 border-blue-100",
  CARPENTRY: "bg-orange-50 text-orange-700 border-orange-100",
  ELECTRICITY: "bg-yellow-50 text-yellow-700 border-yellow-100",
  PAINTING: "bg-purple-50 text-purple-700 border-purple-100",
  HVAC: "bg-cyan-50 text-cyan-700 border-cyan-100",
  SECURITY: "bg-red-50 text-red-700 border-red-100",
  IT_SERVICES: "bg-indigo-50 text-indigo-700 border-indigo-100",
  OTHER: "bg-gray-100 text-gray-600 border-gray-200",
  // Execution types
  IN_HOUSE: "bg-gray-50 text-gray-700 border-gray-200",
  OUTSOURCED: "bg-black text-white border-black",
  HYBRID: "bg-gray-800 text-white border-gray-900",
  // Task priorities
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
  MEDIUM: "bg-gray-400 text-white border-gray-500",
  HIGH: "bg-gray-800 text-white border-gray-900",
  URGENT: "bg-black text-white border-black font-black uppercase",
};

interface StatusBadgeProps {
  value: string;
  className?: string;
}

export function StatusBadge({ value, className = "" }: StatusBadgeProps) {
  const style = STATUS_STYLES[value] || "bg-gray-100 text-gray-600 border-gray-200";
  const label = value.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${style} ${className}`}
    >
      {label.toLowerCase()}
    </span>
  );
}
