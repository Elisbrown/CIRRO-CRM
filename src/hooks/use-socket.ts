"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export function useSocket() {
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectAttempts = useRef(0);

    useEffect(() => {
        if (!session?.user?.id) return;

        // Connect to the local server
        // Requirement 4: socket.io connected to the local server IP
        const socketInstance = io(window.location.origin, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
            reconnectAttempts.current = 0;

            // Register online status
            socketInstance.emit("user-connected", session.user.id);

            // Join a personal room for direct messages
            socketInstance.emit("join-room", `user-${session.user.id}`);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [session?.user?.id]);

    const joinGroup = useCallback((groupId: number) => {
        if (socket) {
            socket.emit("join-room", `group-${groupId}`);
        }
    }, [socket]);

    const joinGroups = useCallback((groupIds: number[]) => {
        if (socket) {
            groupIds.forEach(id => {
                socket.emit("join-room", `group-${id}`);
            });
        }
    }, [socket]);

    const leaveGroup = useCallback((groupId: number) => {
        if (socket) {
            socket.emit("leave-room", `group-${groupId}`);
        }
    }, [socket]);

    const sendMessage = useCallback((data: {
        groupId?: number;
        receiverId?: number;
        senderId: number;
        content: string;
        clientSideId?: string;
    }) => {
        if (socket) {
            socket.emit("send-message", data);
        }
    }, [socket]);

    const emitGroupCreated = useCallback((group: any) => {
        if (socket) {
            socket.emit("group-created", group);
        }
    }, [socket]);

    const emitStatusUpdate = useCallback((status: string) => {
        if (socket && session?.user?.id) {
            socket.emit("update-user-status", { userId: session.user.id, status });
        }
    }, [socket, session?.user?.id]);

    const emitMessageDeleted = useCallback((roomId: string, messageId: number) => {
        if (socket) {
            socket.emit("message-deleted", { roomId, messageId });
        }
    }, [socket]);

    const emitMessageUpdated = useCallback((roomId: string, message: any) => {
        if (socket) {
            socket.emit("message-updated", { roomId, message });
        }
    }, [socket]);

    const emitCallUser = useCallback((data: { to: string, offer: any, fromName: string, type: 'video' | 'audio' }) => {
        if (socket) socket.emit("call-user", data);
    }, [socket]);

    const emitMakeAnswer = useCallback((data: { to: string, answer: any }) => {
        if (socket) socket.emit("make-answer", data);
    }, [socket]);

    const emitIceCandidate = useCallback((data: { to: string, candidate: any }) => {
        if (socket) socket.emit("ice-candidate", data);
    }, [socket]);

    const emitRejectCall = useCallback((data: { to: string }) => {
        if (socket) socket.emit("reject-call", data);
    }, [socket]);

    const emitEndCall = useCallback((data: { to: string }) => {
        if (socket) socket.emit("end-call", data);
    }, [socket]);

    return {
        socket,
        isConnected,
        joinGroup,
        joinGroups,
        leaveGroup,
        sendMessage,
        emitGroupCreated,
        emitStatusUpdate,
        emitMessageDeleted,
        emitMessageUpdated,
        emitCallUser,
        emitMakeAnswer,
        emitIceCandidate,
        emitRejectCall,
        emitEndCall,
    };
}
