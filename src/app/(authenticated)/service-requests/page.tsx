"use client";

import { useState, useEffect } from "react";
import {
  useServiceRequestsList,
  useCreateServiceRequest,
  useUpdateServiceRequest,
  useDeleteServiceRequest,
  useContactsLookup,
  useCatalogList,
  useMachinesList,
  useStaffLookup,
  useSuppliersLookup,
  useServiceRequestDetail,
} from "@/hooks/use-data";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { ReferralPopup } from "@/components/service-requests/ReferralPopup";
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  DollarSign,
  TrendingUp,
  Printer,
  UserPlus,
  X,
  Edit,
  Save,
} from "lucide-react";
import { format } from "date-fns";

export default function ServiceRequestsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [buFilter, setBuFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSR, setEditingSR] = useState<any>(null);

  const { data, isLoading } = useServiceRequestsList({
    page,
    search,
    status: statusFilter || undefined,
    businessUnit: buFilter || undefined,
    limit: 25,
  });

  const createMutation = useCreateServiceRequest();
  const updateMutation = useUpdateServiceRequest();
  const deleteMutation = useDeleteServiceRequest();
  const { data: contacts } = useContactsLookup();
  const { data: catalog } = useCatalogList();
  const { data: machines } = useMachinesList();
  const { data: staffLookup } = useStaffLookup();
  const { data: suppliers } = useSuppliersLookup();

  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { data: srDetail } = useServiceRequestDetail(editId ? parseInt(editId) : null);

  useEffect(() => {
    if (srDetail && !editingSR) {
      handleOpenEdit(srDetail);
    }
  }, [srDetail, editingSR]);

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function handleOpenCreate() {
    setEditingSR(null);
    setDrawerOpen(true);
  }

  function handleOpenEdit(sr: any) {
    setEditingSR(sr);
    setDrawerOpen(true);
  }

  function netProfit(sr: {
    finalAmount: number | null;
    supplyCost: number;
    outsourceCost: number;
    laborCost: number;
  }) {
    const revenue = Number(sr.finalAmount || 0);
    const cost = Number(sr.supplyCost) + Number(sr.outsourceCost) + Number(sr.laborCost);
    return revenue - cost;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track jobs, costs, and revenue across business units
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by SR ID, contact, or notes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <select
          value={buFilter}
          onChange={(e) => { setBuFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All Units</option>
          <option value="JOYSUN">Joysun Printing</option>
          <option value="OFFIZONE">Offizone Coworking</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <button onClick={handleSearch} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Request</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Quoted</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Final</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Profit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Delivery</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : !data?.items.length ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                    No service requests found
                  </td>
                </tr>
              ) : (
                data.items.map((sr) => {
                  const profit = netProfit(sr);
                  return (
                    <tr key={sr.id} className="transition-colors hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{sr.requestId}</p>
                        <p className="text-xs text-gray-400">{sr.businessUnit === "JOYSUN" ? "Joysun Printing" : "Offizone Coworking"} · {sr.executionType.replace(/_/g, " ").toLowerCase()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{sr.contact.firstName} {sr.contact.lastName}</p>
                        {sr.contact.companyName && <p className="text-xs text-gray-400">{sr.contact.companyName}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sr.service?.serviceName || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge value={sr.status} /></td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {sr.quotedAmount != null ? `XAF ${Number(sr.quotedAmount).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {sr.finalAmount != null ? `XAF ${Number(sr.finalAmount).toLocaleString()}` : "—"}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-semibold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {sr.finalAmount != null ? `XAF ${profit.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {sr.deliveryDate ? format(new Date(sr.deliveryDate), "MMM d") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(sr); }}
                            className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (confirm("Delete this request?")) deleteMutation.mutate(sr.id); }}
                            className="flex h-8 w-8 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

      {/* Create/Edit SR Drawer */}
      <SRDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingSR(null); }}
        editingSR={editingSR}
        contacts={contacts || []}
        catalog={catalog || []}
        machines={machines || []}
        staffList={staffLookup || []}
        suppliers={suppliers || []}
        createMutation={createMutation}
        updateMutation={updateMutation}
      />
    </div>
  );
}

/* ─── Service Request Drawer (Create + Edit) ─────────────── */

function SRDrawer({
  open,
  onClose,
  editingSR,
  contacts,
  catalog,
  machines,
  staffList,
  suppliers,
  createMutation,
  updateMutation,
}: {
  open: boolean;
  onClose: () => void;
  editingSR: any;
  contacts: Array<{ id: number; firstName: string; lastName: string; companyName: string | null }>;
  catalog: Array<{ id: number; serviceName: string; businessUnit: string; basePrice: number }>;
  machines: Array<{ id: number; name: string; model: string | null; status: string }>;
  staffList: Array<{ id: number; firstName: string; lastName: string; department: string }>;
  suppliers: Array<{ id: number; name: string; category: string }>;
  createMutation: ReturnType<typeof useCreateServiceRequest>;
  updateMutation: ReturnType<typeof useUpdateServiceRequest>;
}) {
  const isEditing = !!editingSR;

  const defaultFormData = {
    contactId: "",
    businessUnit: "JOYSUN",
    serviceId: "",
    executionType: "IN_HOUSE",
    machineId: "",
    supplierId: "",
    quotedAmount: "",
    finalAmount: "",
    supplyCost: "0",
    outsourceCost: "0",
    laborCost: "0",
    status: "DRAFT",
    notes: "",
    deliveryDate: "",
    // Print job fields (Joysun)
    paperSize: "",
    colorMode: "",
    quantity: "1",
    finishType: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [referral, setReferral] = useState<{ id: number; type: "STAFF" | "CONTACT"; name: string } | null>(null);
  const [referralOpen, setReferralOpen] = useState(false);

  // Reset form when editingSR changes
  useEffect(() => {
    if (editingSR) {
      setFormData({
        contactId: String(editingSR.contactId || ""),
        businessUnit: editingSR.businessUnit || "JOYSUN",
        serviceId: editingSR.serviceId ? String(editingSR.serviceId) : "",
        executionType: editingSR.executionType || "IN_HOUSE",
        machineId: editingSR.machineId ? String(editingSR.machineId) : "",
        supplierId: editingSR.supplierId ? String(editingSR.supplierId) : "",
        quotedAmount: editingSR.quotedAmount != null ? String(editingSR.quotedAmount) : "",
        finalAmount: editingSR.finalAmount != null ? String(editingSR.finalAmount) : "",
        supplyCost: String(editingSR.supplyCost || 0),
        outsourceCost: String(editingSR.outsourceCost || 0),
        laborCost: String(editingSR.laborCost || 0),
        status: editingSR.status || "DRAFT",
        notes: editingSR.notes || "",
        deliveryDate: editingSR.deliveryDate
          ? new Date(editingSR.deliveryDate).toISOString().split("T")[0]
          : "",
        paperSize: editingSR.paperSize || "",
        colorMode: editingSR.colorMode || "",
        quantity: editingSR.quantity ? String(editingSR.quantity) : "1",
        finishType: editingSR.finishType || "",
      });
      if (editingSR.referralId && editingSR.referralType) {
        setReferral({
          id: editingSR.referralId,
          type: editingSR.referralType,
          name: editingSR.referralType === "STAFF" ? "Staff Referral" : "Contact Referral",
        });
      } else {
        setReferral(null);
      }
    } else {
      setFormData(defaultFormData);
      setReferral(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSR]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: any = {
      contactId: parseInt(formData.contactId),
      businessUnit: formData.businessUnit,
      serviceId: formData.serviceId ? parseInt(formData.serviceId) : null,
      executionType: formData.executionType,
      machineId: formData.machineId ? parseInt(formData.machineId) : null,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
      referralId: referral?.id || null,
      referralType: referral?.type || null,
      status: formData.status,
      quotedAmount: formData.quotedAmount ? parseFloat(formData.quotedAmount) : null,
      finalAmount: formData.finalAmount ? parseFloat(formData.finalAmount) : null,
      supplyCost: parseFloat(formData.supplyCost) || 0,
      outsourceCost: parseFloat(formData.outsourceCost) || 0,
      laborCost: parseFloat(formData.laborCost) || 0,
      notes: formData.notes || undefined,
      deliveryDate: formData.deliveryDate || null,
      paperSize: formData.paperSize || null,
      colorMode: formData.colorMode || null,
      quantity: formData.quantity ? parseInt(formData.quantity) : 1,
      finishType: formData.finishType || null,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: editingSR.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
      setFormData(defaultFormData);
      setReferral(null);
    } catch (error) {
      console.error("Failed to save service request:", error);
    }
  }

  const filteredCatalog = catalog.filter((c) => c.businessUnit === formData.businessUnit);
  const isJoysun = formData.businessUnit === "JOYSUN";
  const isOffizone = formData.businessUnit === "OFFIZONE";
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  return (
    <SlideDrawer open={open} onClose={onClose} title={isEditing ? "Edit Service Request" : "New Service Request"} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client & BU */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Client *</label>
            <select name="contactId" value={formData.contactId} onChange={onChange} required className="form-input">
              <option value="">Select client...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.companyName ? ` (${c.companyName})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Business Unit *</label>
            <select name="businessUnit" value={formData.businessUnit} onChange={onChange} className="form-input">
              <option value="JOYSUN">Joysun Printing</option>
              <option value="OFFIZONE">Offizone Coworking</option>
            </select>
          </div>
        </div>

        {/* Service & Machine (Joysun) / Service only (Offizone) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Service</label>
            <select name="serviceId" value={formData.serviceId} onChange={onChange} className="form-input">
              <option value="">Select service...</option>
              {filteredCatalog.map((s) => (
                <option key={s.id} value={s.id}>{s.serviceName} – XAF {Number(s.basePrice).toLocaleString()}</option>
              ))}
            </select>
          </div>
          {isJoysun && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Machine</label>
              <select name="machineId" value={formData.machineId} onChange={onChange} className="form-input">
                <option value="">None</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}{m.model ? ` (${m.model})` : ""}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status (for editing) */}
        {isEditing && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={formData.status} onChange={onChange} className="form-input">
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>
        )}

        {/* Execution Type & Supplier */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Execution Type</label>
            <select name="executionType" value={formData.executionType} onChange={onChange} className="form-input">
              <option value="IN_HOUSE">In-House</option>
              <option value="OUTSOURCED">Outsourced</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          {(formData.executionType === "OUTSOURCED" || formData.executionType === "HYBRID") && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Supplier</label>
              <select name="supplierId" value={formData.supplierId} onChange={onChange} className="form-input">
                <option value="">Select supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category.replace(/_/g, " ").toLowerCase()})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Referral */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Referral</label>
          {referral ? (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-black">
                {referral.type.toLowerCase()}
              </span>
              <span className="flex-1 text-sm text-gray-900">{referral.name}</span>
              <button type="button" onClick={() => setReferral(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setReferralOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-black"
            >
              <UserPlus className="h-4 w-4" />
              Add referral (staff or contact)
            </button>
          )}
        </div>

        {/* Print Job Fields (Joysun only) */}
        {isJoysun && (
          <div className="rounded-lg border border-gray-200 bg-orange-50/50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Printer className="h-4 w-4 text-orange-500" /> Print Job Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Paper Size</label>
                <select name="paperSize" value={formData.paperSize} onChange={onChange} className="form-input">
                  <option value="">Select...</option>
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="A2">A2</option>
                  <option value="A1">A1</option>
                  <option value="A0">A0</option>
                  <option value="Letter">Letter</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Color Mode</label>
                <select name="colorMode" value={formData.colorMode} onChange={onChange} className="form-input">
                  <option value="">Select...</option>
                  <option value="CMYK">CMYK (Full Color)</option>
                  <option value="BW">Black & White</option>
                  <option value="Spot">Spot Color</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Quantity</label>
                <input name="quantity" type="number" min="1" value={formData.quantity} onChange={onChange} className="form-input" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Finish Type</label>
                <select name="finishType" value={formData.finishType} onChange={onChange} className="form-input">
                  <option value="">None</option>
                  <option value="Lamination">Lamination</option>
                  <option value="Binding">Binding</option>
                  <option value="Folding">Folding</option>
                  <option value="Die-Cut">Die-Cut</option>
                  <option value="Embossing">Embossing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Financial */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <DollarSign className="h-4 w-4 text-gray-500" /> Financial Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                {isOffizone ? "Standard Price" : "Quoted Amount"}
              </label>
              <input name="quotedAmount" type="number" step="0.01" value={formData.quotedAmount} onChange={onChange} className="form-input" placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                {isOffizone ? "Actual Price" : "Final Amount"}
              </label>
              <input name="finalAmount" type="number" step="0.01" value={formData.finalAmount} onChange={onChange} className="form-input" placeholder="0" />
            </div>
          </div>
          {isJoysun && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Supply Cost</label>
                <input name="supplyCost" type="number" step="0.01" value={formData.supplyCost} onChange={onChange} className="form-input" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Outsource Cost</label>
                <input name="outsourceCost" type="number" step="0.01" value={formData.outsourceCost} onChange={onChange} className="form-input" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Labor Cost</label>
                <input name="laborCost" type="number" step="0.01" value={formData.laborCost} onChange={onChange} className="form-input" />
              </div>
            </div>
          )}
          {formData.finalAmount && (
            <div className="mt-3 flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-gray-600">Net Profit:</span>
              <span className={`text-sm font-bold ${
                (parseFloat(formData.finalAmount) || 0) - (parseFloat(formData.supplyCost) || 0) - (parseFloat(formData.outsourceCost) || 0) - (parseFloat(formData.laborCost) || 0) >= 0
                  ? "text-emerald-600" : "text-red-600"
              }`}>
                XAF {((parseFloat(formData.finalAmount) || 0) - (parseFloat(formData.supplyCost) || 0) - (parseFloat(formData.outsourceCost) || 0) - (parseFloat(formData.laborCost) || 0)).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Delivery Date & Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Delivery Date</label>
            <input name="deliveryDate" type="date" value={formData.deliveryDate} onChange={onChange} className="form-input" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
          <textarea name="notes" rows={3} value={formData.notes} onChange={onChange} className="form-input" placeholder="Additional details..." />
        </div>

        {mutationError && (
          <p className="text-sm text-red-600">{mutationError.message}</p>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isEditing ? "Save Changes" : "Create Request"}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>

      {/* Referral Popup */}
      <ReferralPopup
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        onSelect={setReferral}
        staffList={staffList}
        contactList={contacts}
      />
    </SlideDrawer>
  );
}
