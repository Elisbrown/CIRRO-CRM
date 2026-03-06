"use client";

import { X, ExternalLink, Calendar, User, Clock, Tag, FileText, CheckSquare, ShoppingBag, Printer, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

interface PreviewSidebarProps {
    category: string;
    id: number;
    onClose: () => void;
}

export function PreviewSidebar({ category, id, onClose }: PreviewSidebarProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Determine the API endpoint based on category
        let endpoint = "";
        switch (category) {
            case "staff": endpoint = `/api/staff/${id}`; break;
            case "tasks": endpoint = `/api/tasks/${id}`; break;
            case "servicerequest":
            case "service requests": endpoint = `/api/service-requests/${id}`; break;
            case "suppliers": endpoint = `/api/suppliers/${id}`; break;
            case "machines": endpoint = `/api/machines/${id}`; break;
            case "catalog": endpoint = `/api/catalog/${id}`; break;
        }

        if (endpoint) {
            fetch(endpoint)
                .then(res => res.json())
                .then(json => {
                    setData(json.data);
                    setLoading(false);
                });
        }
    }, [category, id]);

    const getFullLink = () => {
        switch (category) {
            case "staff": return `/staff/${id}`;
            case "tasks": return `/tasks?id=${id}`;
            case "servicerequest": return `/service-requests?id=${id}`;
            default: return "#";
        }
    };

    return (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col items-stretch animate-in slide-in-from-right duration-300">
            <div className="h-14 px-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Preview</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        {/* Main Header */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                {data.firstName ? `${data.firstName} ${data.lastName}` : (data.name || data.title || data.requestId || data.serviceName)}
                            </h2>
                            {data.status && (
                                <span className="mt-2 inline-block text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded uppercase">
                                    {data.status}
                                </span>
                            )}
                        </div>

                        {/* Quick Stats/Details */}
                        <div className="grid grid-cols-1 gap-4">
                            {data.email && (
                                <DetailRow icon={FileText} label="Email" value={data.email} />
                            )}
                            {data.phone && (
                                <DetailRow icon={Clock} label="Phone" value={data.phone} />
                            )}
                            {data.priority && (
                                <DetailRow icon={Tag} label="Priority" value={data.priority} />
                            )}
                            {data.dueDate && (
                                <DetailRow icon={Calendar} label="Due Date" value={format(new Date(data.dueDate), "PPP")} />
                            )}
                            {data.businessUnit && (
                                <DetailRow icon={ShoppingBag} label="Unit" value={data.businessUnit} />
                            )}
                        </div>

                        {/* Description/Notes */}
                        {(data.description || data.notes) && (
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Description</h4>
                                <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                    {data.description || data.notes}
                                </div>
                            </div>
                        )}

                        {/* Action Link */}
                        <div className="pt-6">
                            <Link
                                href={getFullLink()}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-bold transition-colors"
                                onClick={onClose}
                            >
                                <span>View Full Record</span>
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        Could not load data for this item.
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-1.5 bg-gray-50 rounded">
                <Icon className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
                <p className="text-sm text-gray-900 font-medium">{value}</p>
            </div>
        </div>
    );
}
