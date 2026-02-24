"use client";

import { useContactDetail } from "@/hooks/use-data";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  User,
  FileText,
  MessageSquare,
  PhoneCall,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface ContactDetailDrawerProps {
  contactId: number | null;
  open: boolean;
  onClose: () => void;
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  EMAIL: Mail,
  CALL: PhoneCall,
  NOTE: FileText,
  MEETING: MessageSquare,
};

export function ContactDetailDrawer({ contactId, open, onClose }: ContactDetailDrawerProps) {
  const { data: contact, isLoading } = useContactDetail(contactId);

  return (
    <SlideDrawer open={open} onClose={onClose} title="Contact Details" width="max-w-xl">
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : !contact ? (
        <p className="py-8 text-center text-sm text-gray-400">Contact not found</p>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {contact.firstName} {contact.lastName}
              </h3>
              {contact.companyName && (
                <p className="text-sm text-gray-500">{contact.companyName}</p>
              )}
              <div className="mt-2 flex gap-2">
                <StatusBadge value={contact.type} />
                <StatusBadge value={contact.status} />
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {contact.email && (
                <InfoRow icon={Mail} label="Email" value={contact.email} />
              )}
              {contact.phone && (
                <InfoRow icon={Phone} label="Phone" value={contact.phone} />
              )}
              {(contact.city || contact.country) && (
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={[contact.city, contact.country].filter(Boolean).join(", ")}
                />
              )}
              {contact.leadSource && (
                <InfoRow icon={Building2} label="Source" value={contact.leadSource} />
              )}
              {contact.assignedRep && (
                <InfoRow
                  icon={User}
                  label="Assigned To"
                  value={`${contact.assignedRep.firstName} ${contact.assignedRep.lastName}`}
                />
              )}
              <InfoRow
                icon={Calendar}
                label="Created"
                value={format(new Date(contact.createdAt), "MMM d, yyyy")}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Service Requests" value={contact._count.serviceRequests} />
            <StatCard label="Activities" value={contact._count.activities} />
          </div>

          {/* Service Requests */}
          {contact.serviceRequests.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Recent Service Requests</h4>
              <div className="space-y-2">
                {contact.serviceRequests.map((sr) => (
                  <div
                    key={sr.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sr.requestId}</p>
                      <p className="text-xs text-gray-400">{sr.businessUnit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {sr.finalAmount != null && (
                        <span className="text-sm font-medium text-gray-700">
                          XAF {sr.finalAmount.toLocaleString()}
                        </span>
                      )}
                      <StatusBadge value={sr.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          {contact.activities.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Activity Timeline</h4>
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-4 top-2 h-[calc(100%-16px)] w-px bg-gray-200" />
                {contact.activities.map((act, i) => {
                  const Icon = ACTIVITY_ICONS[act.type] || Clock;
                  return (
                    <div key={act.id} className="relative flex gap-4 pb-4">
                      <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-100">
                        <Icon className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900 capitalize">{act.type.toLowerCase().replace(/_/g, " ")}</p>
                        {act.content && (
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{act.content}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {act.staff
                            ? `${act.staff.firstName} ${act.staff.lastName} • `
                            : ""}
                          {format(new Date(act.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </SlideDrawer>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
