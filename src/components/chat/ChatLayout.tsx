import { ChatProvider, useChat } from "@/contexts/chat-context";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { PreviewSidebar } from "@/components/chat/PreviewSidebar";
import { useState } from "react";

export function ChatLayout() {
    return (
        <ChatProvider>
            <ChatLayoutContent />
        </ChatProvider>
    );
}

function ChatLayoutContent() {
    const { activeRoom } = useChat();
    const [previewItem, setPreviewItem] = useState<{ category: string; id: number } | null>(null);

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative" suppressHydrationWarning>
            {/* Chat Sidebar: Groups and Staff */}
            <div className={`${activeRoom ? "hidden md:flex" : "flex"} w-full md:w-64 h-full shrink-0 border-r border-gray-200`} suppressHydrationWarning>
                <ChatSidebar />
            </div>

            {/* Main Chat Window */}
            <div className={`${activeRoom ? "flex" : "hidden md:flex"} flex-1 h-full min-w-0`} suppressHydrationWarning>
                <ChatWindow onTagClick={(category: string, id: number) => setPreviewItem({ category, id })} />
            </div>

            {/* Preview Sidebar for @tags */}
            {previewItem && (
                <div className="absolute inset-0 z-50 md:relative md:inset-auto md:w-80 h-full border-l border-gray-200 bg-white shadow-xl md:shadow-none">
                    <PreviewSidebar
                        category={previewItem.category}
                        id={previewItem.id}
                        onClose={() => setPreviewItem(null)}
                    />
                </div>
            )}
        </div>
    );
}
