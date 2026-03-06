"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "next-auth/react";

import { useSearchParams } from "next/navigation";

export interface Message {
    id: number | string;
    senderId: number;
    content: string;
    groupId?: number | null;
    receiverId?: number | null;
    attachments?: any[];
    createdAt: string;
    sender?: {
        firstName: string;
        lastName: string;
        avatarUrl?: string | null;
    };
    parentMessage?: {
        content: string;
        sender: { firstName: string; lastName: string };
    } | null;
    reactions?: Array<{
        id: number;
        emoji: string;
        staffId: number;
        staff: { firstName: string; lastName: string };
    }>;
    poll?: {
        id: number;
        question: string;
        isMultiple: boolean;
        options: Array<{
            id: number;
            text: string;
            _count: { votes: number };
        }>;
    } | null;
    _count?: {
        replies: number;
    };
}

interface ChatContextType {
    activeRoom: { type: "group" | "user"; id: number; name?: string; avatarUrl?: string | null } | null;
    setActiveRoom: (room: { type: "group" | "user"; id: number; name?: string; avatarUrl?: string | null } | null) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    sendMessage: (content: string, attachments?: any[], parentMessageId?: number) => Promise<void>;
    isConnected: boolean;
    unreadCounts: Record<string, number>;
    replyTo: Message | null;
    setReplyTo: (msg: Message | null) => void;
    socket: any;
    onlineUsers: Array<{ userId: number, status: string }>;
    toggleStatus: (status: string) => void;
    deleteMessage: (messageId: number) => Promise<void>;
    updateMessage: (messageId: number, content: string) => Promise<void>;
    groups: any[];
    staff: any[];
    fetchGroups: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const { socket, isConnected, joinGroup, joinGroups, leaveGroup, sendMessage: socketSendMessage } = useSocket();
    const [activeRoom, setActiveRoom] = useState<{ type: "group" | "user"; id: number; name?: string; avatarUrl?: string | null } | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [replyTo, setReplyTo] = useState<Message | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("/newmessage.mp3");
        audioRef.current.load();
    }, []);

    // Audio notification
    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((err: any) => {
                console.log("Audio play blocked, needs user interaction:", err);
            });
        }
    }, []);

    // Fetch persistent unreads on mount
    useEffect(() => {
        if (session?.user?.id) {
            fetch("/api/chat/unread-counts")
                .then(res => res.json())
                .then(json => {
                    if (json.success) {
                        setUnreadCounts(json.data);
                    }
                });
        }
    }, [session?.user?.id]);

    // Join ALL user groups on connect to receive notifications/unreads
    useEffect(() => {
        if (isConnected && session?.user?.id) {
            fetch("/api/chat/groups")
                .then(res => res.json())
                .then(json => {
                    if (json.success && json.data) {
                        const groupIds = json.data.map((g: any) => g.id);
                        joinGroups(groupIds);
                    }
                });
        }
    }, [isConnected, session?.user?.id, joinGroups]);

    // Track active room and mark as read
    useEffect(() => {
        if (!activeRoom) return;

        // Mark as read in DB
        fetch("/api/chat/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: activeRoom.type, id: activeRoom.id })
        });

        if (activeRoom.type === "group") {
            joinGroup(activeRoom.id);
            setUnreadCounts(prev => ({ ...prev, [`group-${activeRoom.id}`]: 0 }));
            return () => leaveGroup(activeRoom.id);
        } else {
            setUnreadCounts(prev => ({ ...prev, [`user-${activeRoom.id}`]: 0 }));
        }

        // Unlock audio context on first room selection (helps mobile/tablets)
        if (audioRef.current && audioRef.current.paused) {
            const silentPlay = audioRef.current.play();
            if (silentPlay !== undefined) {
                silentPlay.then(() => {
                    audioRef.current?.pause();
                    audioRef.current!.currentTime = 0;
                }).catch(() => { });
            }
        }

        setReplyTo(null);
    }, [activeRoom, joinGroup, leaveGroup]);

    // Register Service Worker and request notification permissions
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then((reg) => {
                console.log("Service Worker registered in ChatContext");
            });
        }

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: Message) => {
            const currentUserId = parseInt(session?.user?.id || "0");
            const isMsgForActiveRoom =
                (activeRoom?.type === "group" && msg.groupId === activeRoom.id) ||
                (activeRoom?.type === "user" && msg.receiverId === currentUserId && msg.senderId === activeRoom.id) ||
                (activeRoom?.type === "user" && msg.senderId === currentUserId && msg.receiverId === activeRoom.id);

            // Play sound for all INCOMING messages from others
            if (msg.senderId !== currentUserId) {
                playNotificationSound();

                // Trigger browser notification if document is hidden
                if (document.hidden) {
                    const senderName = msg.sender?.firstName || "Someone";
                    const title = msg.groupId ? `New message in Channel` : `Message from ${senderName}`;
                    const body = msg.content.substring(0, 100);

                    const type = msg.groupId ? "group" : "user";
                    const roomId = msg.groupId || msg.senderId;
                    const roomName = msg.groupId ? "Channel" : senderName;
                    const url = `/messages?type=${type}&id=${roomId}&name=${encodeURIComponent(roomName)}`;

                    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({
                            type: "SHOW_NOTIFICATION",
                            title,
                            body,
                            url
                        });
                    } else if ("Notification" in window && Notification.permission === "granted") {
                        new Notification(title, { body });
                    }
                }
            }

            if (isMsgForActiveRoom) {
                setMessages((prev) => [...prev, msg]);
            } else {
                // Increment unread count
                const roomKey = msg.groupId ? `group-${msg.groupId}` : `user-${msg.senderId}`;
                setUnreadCounts(prev => ({
                    ...prev,
                    [roomKey]: (prev[roomKey] || 0) + 1
                }));
            }
        };

        socket.on("new-message", handleNewMessage);
        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [socket, activeRoom, session?.user?.id, playNotificationSound]);

    const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: number, status: string }>>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);

    const fetchGroups = () => {
        fetch("/api/chat/groups")
            .then((res) => res.json())
            .then((json) => setGroups(json.data || []));
    };

    const fetchStaff = () => {
        fetch("/api/staff/lookup")
            .then((res) => res.json())
            .then((json) => setStaff(json.data || []));
    };

    useEffect(() => {
        fetchGroups();
        fetchStaff();
    }, []);

    // Listen for status updates
    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (users: any) => {
            setOnlineUsers(users);
        };

        const handleGroupCreated = () => {
            fetchGroups();
        };

        socket.on("status-update", handleStatusUpdate);
        socket.on("group-created", handleGroupCreated);

        return () => {
            socket.off("status-update", handleStatusUpdate);
            socket.off("group-created", handleGroupCreated);
        };
    }, [socket]);

    // Listen for message deletions and updates
    useEffect(() => {
        if (!socket) return;

        const handleMessageDeleted = (data: { messageId: number }) => {
            setMessages(prev => prev.filter(m => m.id !== data.messageId));
        };

        const handleMessageUpdated = (data: { message: Message }) => {
            setMessages(prev => prev.map(m => m.id === data.message.id ? data.message : m));
        };

        socket.on("message-deleted", handleMessageDeleted);
        socket.on("message-updated", handleMessageUpdated);

        return () => {
            socket.off("message-deleted", handleMessageDeleted);
            socket.off("message-updated", handleMessageUpdated);
        };
    }, [socket]);

    const { emitStatusUpdate, emitMessageDeleted, emitMessageUpdated } = useSocket();

    const toggleStatus = (status: string) => {
        emitStatusUpdate(status);
    };

    const deleteMessage = async (messageId: number) => {
        try {
            const res = await fetch(`/api/chat/messages/${messageId}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (json.success) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
                const roomKey = activeRoom?.type === "group" ? `group-${activeRoom.id}` : `user-${activeRoom!.id}`;
                emitMessageDeleted(roomKey, messageId);
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const updateMessage = async (messageId: number, content: string) => {
        try {
            const res = await fetch(`/api/chat/messages/${messageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const json = await res.json();
            if (json.success) {
                setMessages(prev => prev.map(m => m.id === messageId ? json.data : m));
                const roomKey = activeRoom?.type === "group" ? `group-${activeRoom.id}` : `user-${activeRoom!.id}`;
                emitMessageUpdated(roomKey, json.data);
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const sendMessage = async (content: string, attachments: any[] = [], parentMessageId?: number) => {
        if (!session?.user?.id || !activeRoom) return;

        const userId = parseInt(session.user.id);

        try {
            const res = await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId: activeRoom.type === "group" ? activeRoom.id : null,
                    receiverId: activeRoom.type === "user" ? activeRoom.id : null,
                    content,
                    attachments,
                    parentMessageId: parentMessageId || replyTo?.id,
                }),
            });

            const json = await res.json();
            if (json.success) {
                // Emit via socket for others
                socketSendMessage({
                    groupId: activeRoom.type === "group" ? activeRoom.id : undefined,
                    receiverId: activeRoom.type === "user" ? activeRoom.id : undefined,
                    senderId: userId,
                    content,
                });

                // Add to local state (already contains sender info from API result)
                setMessages((prev) => [...prev, json.data]);
                setReplyTo(null);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <ChatContext.Provider value={{
            activeRoom,
            setActiveRoom,
            messages,
            setMessages,
            sendMessage,
            isConnected,
            unreadCounts,
            replyTo,
            setReplyTo,
            socket,
            onlineUsers,
            toggleStatus,
            deleteMessage,
            updateMessage,
            groups,
            staff,
            fetchGroups
        }}>
            <Suspense fallback={null}>
                <SearchParamsHandler setActiveRoom={setActiveRoom} />
            </Suspense>
            {children}
        </ChatContext.Provider>
    );
}

function SearchParamsHandler({ setActiveRoom }: { setActiveRoom: any }) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const type = searchParams.get("type") as "group" | "user" | null;
        const id = searchParams.get("id");
        const name = searchParams.get("name");

        if (type && id) {
            const roomId = parseInt(id);
            setActiveRoom((prev: any) => {
                if (prev?.type === type && prev?.id === roomId) return prev;
                return { type, id: roomId, name: name || undefined };
            });
        }
    }, [searchParams, setActiveRoom]);

    return null;
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
