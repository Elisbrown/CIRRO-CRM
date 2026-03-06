"use client";

import { useState, useEffect } from "react";
import { X, Users, Lock, Globe } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";

interface CreateGroupModalProps {
    onClose: () => void;
    onCreated: (group: any) => void;
}

export function CreateGroupModal({ onClose, onCreated }: CreateGroupModalProps) {
    const { emitGroupCreated } = useSocket();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/staff/lookup")
            .then((res) => res.json())
            .then((json) => setStaff(json.data || []));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/chat/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    isPrivate,
                    members: selectedMembers,
                }),
            });

            const json = await res.json();
            if (json.success) {
                emitGroupCreated(json.data);
                onCreated(json.data);
                onClose();
            }
        } catch (error) {
            console.error("Failed to create group:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (id: number) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Create New Channel</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Group Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. marketing-team"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black resize-none"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 py-2">
                        <button
                            type="button"
                            onClick={() => setIsPrivate(false)}
                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${!isPrivate ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200"
                                }`}
                        >
                            <Globe className="h-5 w-5" />
                            <div className="text-center">
                                <p className="text-xs font-bold">Public</p>
                                <p className="text-[10px] text-gray-500">Anyone can join</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPrivate(true)}
                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${isPrivate ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200"
                                }`}
                        >
                            <Lock className="h-5 w-5" />
                            <div className="text-center">
                                <p className="text-xs font-bold">Private</p>
                                <p className="text-[10px] text-gray-500">Invite only</p>
                            </div>
                        </button>
                    </div>

                    {isPrivate && (
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Invite Members
                            </label>
                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                                {staff.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleMember(s.id)}
                                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm text-gray-700">{s.firstName} {s.lastName}</span>
                                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${selectedMembers.includes(s.id) ? "bg-black border-black text-white" : "border-gray-300"
                                            }`}>
                                            {selectedMembers.includes(s.id) && <span className="text-[10px]">✓</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="w-full py-3 bg-black text-white rounded-md font-bold hover:bg-gray-800 disabled:opacity-50 transition-all"
                        >
                            {loading ? "Creating..." : "Create Channel"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
