"use client";

import { useState } from "react";
import {
  useRentalSpaces, useCreateRentalSpace, useUpdateRentalSpace, useDeleteRentalSpace,
  useRentPayments, useCreateRentPayment,
} from "@/hooks/use-data";
import { useSession } from "next-auth/react";
import {
  Plus, Search, Building2, Calendar, DollarSign, AlertTriangle,
  Edit2, Trash2, X, CreditCard, Clock,
} from "lucide-react";

interface SpaceFormData {
  name: string;
  monthlyRent: number;
  notes: string;
}

interface PaymentFormData {
  spaceId: number;
  amount: number;
  paidAt: string;
  periodStart: string;
  periodEnd: string;
  paymentMethod: string;
  receiptNumber: string;
  notes: string;
}

const SPACE_TYPES = ["Office", "Shop", "Warehouse", "Parking", "Storage", "Event Space", "Other"];

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  OCCUPIED: "bg-blue-100 text-blue-700",
  UNDER_MAINTENANCE: "bg-yellow-100 text-yellow-700",
};

function getExpiryInfo(lastPayment: any) {
  if (!lastPayment?.periodEnd) return { label: "No payments", color: "text-gray-400", days: null };
  const end = new Date(lastPayment.periodEnd);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, color: "text-red-600 font-medium", days };
  if (days <= 30) return { label: `${days}d remaining`, color: "text-yellow-600 font-medium", days };
  return { label: `${days}d remaining`, color: "text-green-600", days };
}

export default function RentPage() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role as string) || "STAFF";
  const [search, setSearch] = useState("");
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<any>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);

  const { data: spacesData, isLoading } = useRentalSpaces({ search, limit: 50 });
  const { data: paymentsData } = useRentPayments({ spaceId: selectedSpaceId || undefined });
  const createSpace = useCreateRentalSpace();
  const updateSpace = useUpdateRentalSpace(editingSpace?.id || 0);
  const deleteSpace = useDeleteRentalSpace();
  const createPayment = useCreateRentPayment();

  const spaces = spacesData?.items || [];

  const [spaceForm, setSpaceForm] = useState<SpaceFormData>({
    name: "", monthlyRent: 0, notes: "",
  });

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    spaceId: 0, amount: 0, paidAt: new Date().toISOString().split("T")[0],
    periodStart: "", periodEnd: "", paymentMethod: "", receiptNumber: "", notes: "",
  });

  const handleEditSpace = (space: any) => {
    setEditingSpace(space);
    setSpaceForm({
      name: space.name,
      monthlyRent: Number(space.monthlyRent),
      notes: space.notes || "",
    });
    setShowSpaceModal(true);
  };

  const handleSaveSpace = async () => {
    try {
      if (editingSpace) {
        await updateSpace.mutateAsync({ ...spaceForm, type: "Other", status: "AVAILABLE" } as any);
      } else {
        await createSpace.mutateAsync({ ...spaceForm, type: "Other", status: "AVAILABLE" } as any);
      }
      setShowSpaceModal(false);
      setEditingSpace(null);
      setSpaceForm({ name: "", monthlyRent: 0, notes: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPayment = (spaceId: number, monthlyRent: number) => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    setPaymentForm({
      spaceId, amount: monthlyRent,
      paidAt: now.toISOString().split("T")[0],
      periodStart: now.toISOString().split("T")[0],
      periodEnd: nextMonth.toISOString().split("T")[0],
      paymentMethod: "Cash", receiptNumber: "", notes: "",
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    try {
      await createPayment.mutateAsync(paymentForm);
      setShowPaymentModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rent Tracking</h1>
          <p className="text-sm text-gray-500">{spaces.length} space{spaces.length !== 1 ? "s" : ""}</p>
        </div>
        {userRole === "MANAGER" && (
          <button
            onClick={() => { setEditingSpace(null); setSpaceForm({ name: "", monthlyRent: 0, notes: "" }); setShowSpaceModal(true); }}
            className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Add Space
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Search spaces..."
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
        </div>
      )}

      {/* Spaces Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space: any) => {
            const lastPayment = space.payments?.[0];
            const expiry = getExpiryInfo(lastPayment);
            return (
              <div key={space.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{space.name}</h3>
                    <p className="text-xs text-gray-500">{space.type} · {space.location || "No location"}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[space.status]}`}>
                    {space.status.replace(/_/g, " ")}
                  </span>
                </div>

                {space.landlordName && (
                  <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">Owner / Landlord</p>
                    <p className="font-medium text-gray-700">{space.landlordName}</p>
                    {space.landlordPhone && <p className="text-gray-500">{space.landlordPhone}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Monthly Rent</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {Number(space.monthlyRent).toLocaleString("en-US")} XAF
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Expiry</p>
                    <p className={`text-sm ${expiry.color}`}>
                      {expiry.days !== null && expiry.days <= 30 && (
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                      )}
                      {expiry.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenPayment(space.id, Number(space.monthlyRent))}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-white bg-black rounded py-1.5 hover:bg-gray-800"
                  >
                    <CreditCard className="w-3 h-3" /> Record Payment
                  </button>
                  {userRole === "MANAGER" && (
                    <>
                      <button onClick={() => handleEditSpace(space)} className="p-1.5 text-gray-400 hover:text-black">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => window.confirm("Delete this space?") && deleteSpace.mutate(space.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {spaces.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No spaces yet. Add one to start tracking rent.</p>
            </div>
          )}
        </div>
      )}

      {/* Space Modal */}
      {showSpaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingSpace ? "Edit Space" : "New Space"}</h2>
              <button onClick={() => setShowSpaceModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Space Name *</label>
                <input value={spaceForm.name} onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. Workshop A" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Rent (XAF)</label>
                <input type="number" value={spaceForm.monthlyRent} onChange={(e) => setSpaceForm({ ...spaceForm, monthlyRent: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={spaceForm.notes} onChange={(e) => setSpaceForm({ ...spaceForm, notes: e.target.value })} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none" placeholder="Landlord info, contact details, etc." />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={handleSaveSpace} disabled={!spaceForm.name} className="flex-1 bg-black text-white font-medium py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50">
                {editingSpace ? "Update" : "Create"} Space
              </button>
              <button onClick={() => setShowSpaceModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount (XAF)</label>
                  <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Paid On</label>
                  <input type="date" value={paymentForm.paidAt} onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Period Start</label>
                  <input type="date" value={paymentForm.periodStart} onChange={(e) => setPaymentForm({ ...paymentForm, periodStart: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Period End</label>
                  <input type="date" value={paymentForm.periodEnd} onChange={(e) => setPaymentForm({ ...paymentForm, periodEnd: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
                  <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Receipt #</label>
                  <input value={paymentForm.receiptNumber} onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
              <button onClick={handleSavePayment} className="flex-1 bg-black text-white font-medium py-2 rounded-md text-sm hover:bg-gray-800">
                Record Payment
              </button>
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
