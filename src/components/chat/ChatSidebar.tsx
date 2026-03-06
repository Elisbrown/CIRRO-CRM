"use client";

import { useChat } from "@/contexts/chat-context";
import { useEffect, useState } from "react";
import { CreateGroupModal } from "./CreateGroupModal";
import { Users, Hash, User, Plus, Search } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";

export function ChatSidebar() {
    const {
        activeRoom,
        setActiveRoom,
        unreadCounts,
        groups,
        staff,
        onlineUsers,
        toggleStatus,
        fetchGroups
    } = useChat();
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const getStatus = (userId: number) => {
        const user = onlineUsers.find(u => u.userId === userId);
        return user ? user.status : "offline";
    };

    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredStaff = staff.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col font-outfit">
            <div className="p-4 border-b border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Messages</h2>
                    <div className="flex items-center gap-2">
                        <select
                            onChange={(e) => toggleStatus(e.target.value)}
                            className="text-[10px] bg-gray-100 border-none rounded px-2 py-1 outline-none font-bold cursor-pointer"
                        >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">
                {/* Groups Section */}
                <div>
                    <div className="flex items-center justify-between px-2 mb-1">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Channels</h3>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-gray-400 hover:text-black transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <ul className="space-y-0.5">
                        {filteredGroups.map((group) => {
                            const unreadCount = unreadCounts[`group-${group.id}`] || 0;
                            return (
                                <li key={group.id}>
                                    <button
                                        onClick={() => setActiveRoom({ type: "group", id: group.id, name: group.name })}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 md:py-1.5 rounded-md text-sm md:text-sm font-medium transition-colors ${activeRoom?.type === "group" && activeRoom.id === group.id
                                            ? "bg-black text-white shadow-md md:shadow-none"
                                            : "text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        <Hash className="h-4 w-4 shrink-0" />
                                        <span className="truncate flex-1 text-left">{group.name}</span>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Direct Messages Section */}
                <div>
                    <div className="flex items-center justify-between px-2 mb-1">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Direct Messages</h3>
                    </div>
                    <ul className="space-y-0.5">
                        {filteredStaff.map((person) => {
                            const unreadCount = unreadCounts[`user-${person.id}`] || 0;
                            const status = getStatus(person.id);
                            return (
                                <li key={person.id}>
                                    <button
                                        onClick={() => setActiveRoom({
                                            type: "user",
                                            id: person.id,
                                            name: `${person.firstName} ${person.lastName}`,
                                            avatarUrl: person.avatarUrl
                                        })}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 md:py-1.5 rounded-md text-sm md:text-sm font-medium transition-colors ${activeRoom?.type === "user" && activeRoom.id === person.id
                                            ? "bg-black text-white shadow-md md:shadow-none"
                                            : "text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        <div className="relative">
                                            {person.avatarUrl ? (
                                                <img src={person.avatarUrl} alt="" className="h-4 w-4 rounded-full" />
                                            ) : (
                                                <User className="h-4 w-4 shrink-0" />
                                            )}
                                            {status === "online" && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
                                            )}
                                        </div>
                                        <span className="truncate flex-1 text-left">{person.firstName} {person.lastName}</span>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={(newGroup) => {
                        fetchGroups();
                        setActiveRoom({ type: "group", id: newGroup.id, name: newGroup.name });
                    }}
                />
            )}
        </div>
    );
}
