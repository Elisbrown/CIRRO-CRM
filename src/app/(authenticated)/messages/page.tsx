"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";

export default function MessagesPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 font-outfit">Team Messaging</h1>
                <p className="text-sm text-gray-500">Private LAN-based communications</p>
            </div>
            <ChatLayout />
        </div>
    );
}
