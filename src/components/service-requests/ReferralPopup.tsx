"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, Users, X } from "lucide-react";

interface ReferralOption {
  id: number;
  name: string;
  type: "STAFF" | "CONTACT";
  subtitle?: string;
}

interface ReferralPopupProps {
  open: boolean;
  onClose: () => void;
  onSelect: (referral: { id: number; type: "STAFF" | "CONTACT"; name: string }) => void;
  staffList: Array<{ id: number; firstName: string; lastName: string; department?: string }>;
  contactList: Array<{ id: number; firstName: string; lastName: string; companyName?: string | null }>;
}

/**
 * Combined referral popup that lets users search across both
 * staff members and contacts in a single modal.
 */
export function ReferralPopup({
  open,
  onClose,
  onSelect,
  staffList,
  contactList,
}: ReferralPopupProps) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"ALL" | "STAFF" | "CONTACT">("ALL");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTab("ALL");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Merge and filter
  const allOptions: ReferralOption[] = [
    ...staffList.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      type: "STAFF" as const,
      subtitle: s.department || "Staff",
    })),
    ...contactList.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      type: "CONTACT" as const,
      subtitle: c.companyName || "Contact",
    })),
  ];

  const filtered = allOptions.filter((o) => {
    const matchesQuery =
      !query || o.name.toLowerCase().includes(query.toLowerCase());
    const matchesTab = tab === "ALL" || o.type === tab;
    return matchesQuery && matchesTab;
  });

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/3 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search staff or contacts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 px-4 py-2">
          {(["ALL", "STAFF", "CONTACT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                tab === t
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {t === "ALL" ? "All" : t === "STAFF" ? "Staff" : "Contacts"}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-60 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No results found</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={`${opt.type}-${opt.id}`}
                onClick={() => {
                  onSelect({ id: opt.id, type: opt.type, name: opt.name });
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    opt.type === "STAFF"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {opt.type === "STAFF" ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{opt.name}</p>
                  <p className="text-xs text-gray-400">{opt.subtitle}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    opt.type === "STAFF"
                      ? "bg-gray-100 text-black"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  {opt.type.toLowerCase()}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
