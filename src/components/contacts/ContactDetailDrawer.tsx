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
  Plus,
  Send,
  Trash2,
  Paperclip,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  useContactAttachments,
  useCreateContactNote,
  useDeleteContactAttachment,
  useUploadContactFile
} from "@/hooks/use-data";

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
  const [activeTab, setActiveTab] = useState<"info" | "notes" | "financials">("info");
  const [noteContent, setNoteContent] = useState("");

  const { data: attachments, isLoading: isAttLoading } = useContactAttachments(contactId);
  const createNote = useCreateContactNote(contactId || 0);
  const deleteAttachment = useDeleteContactAttachment(contactId || 0);
  const uploadFile = useUploadContactFile(contactId || 0);

  const handleAddNote = async () => {
    if (!noteContent.trim() || !contactId) return;
    try {
      await createNote.mutateAsync({
        contactId,
        type: "NOTE",
        content: noteContent.trim(),
      });
      setNoteContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contactId) return;
    try {
      await uploadFile.mutateAsync({ file });
    } catch (err) {
      console.error(err);
    }
  };

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

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["info", "notes", "financials"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors relative ${activeTab === tab ? "text-black" : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </button>
            ))}
          </div>

          {activeTab === "info" && (
            <div className="space-y-6 animate-in fade-in duration-300">
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

              {/* Main Notes Field */}
              {contact.notes && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    General Notes
                  </h4>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap italic">
                    {contact.notes}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Service Requests" value={contact._count.serviceRequests} />
                <StatCard label="Activities" value={contact._count.activities} />
              </div>

              {/* Recent Service Requests */}
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
                    <div className="absolute left-4 top-2 h-[calc(100%-16px)] w-px bg-gray-200" />
                    {contact.activities.map((act) => {
                      const Icon = ACTIVITY_ICONS[act.type.toUpperCase()] || Clock;
                      return (
                        <div key={act.id} className="relative flex gap-4 pb-4">
                          <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-100">
                            <Icon className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {act.type.toLowerCase().replace(/_/g, " ")}
                            </p>
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

          {activeTab === "notes" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Add Note Form */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type a new note here..."
                  className="w-full bg-white rounded-lg border border-gray-200 p-3 text-sm focus:border-black focus:ring-1 focus:ring-black min-h-[100px] resize-none"
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-black transition-colors">
                      <Paperclip className="w-3.5 h-3.5" />
                      Attach File
                    </button>
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={!noteContent.trim() || createNote.isPending}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                  >
                    {createNote.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Save Note
                  </button>
                </div>
              </div>

              {/* Attachments List */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Notes & File History</h4>
                {isAttLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
                  </div>
                ) : attachments?.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No notes or files yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attachments?.map((att: any) => (
                      <div key={att.id} className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-gray-200 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {att.type === "NOTE" ? (
                                <FileText className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Paperclip className="w-4 h-4 text-emerald-500" />
                              )}
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {att.type}
                              </span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400">
                                {format(new Date(att.createdAt), "MMM d, yyyy • h:mm a")}
                              </span>
                            </div>
                            {att.title && (
                              <h5 className="text-sm font-semibold text-gray-900 mb-1">{att.title}</h5>
                            )}
                            {att.content && (
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{att.content}</p>
                            )}
                            {att.type === "FILE" && (
                              <div className="mt-2 flex items-center gap-2">
                                <a
                                  href={att.fileUrl}
                                  download={att.fileName}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <Download className="w-3 h-3" />
                                  {att.fileName}
                                </a>
                                <span className="text-[10px] text-gray-400">
                                  {(att.fileSize / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            )}
                            <div className="mt-3 flex items-center gap-2">
                              {att.uploadedBy && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                    {att.uploadedBy.firstName[0]}{att.uploadedBy.lastName[0]}
                                  </div>
                                  <span className="text-[10px] text-gray-500">
                                    {att.uploadedBy.firstName} {att.uploadedBy.lastName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAttachment.mutate(att.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "financials" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center py-20">
                <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900">Financial History</h4>
                <p className="text-sm text-gray-400">Invoices and payments will appear here.</p>
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
