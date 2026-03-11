"use client";

import { useChat, Message } from "@/contexts/chat-context";
import { useEffect, useState, useRef } from "react";
import { Send, Paperclip, Smile, Hash, User, Tag, X, Plus, MoreHorizontal, Reply, Edit, Trash2, Forward, Eye, Download, ChevronLeft, Video, Phone } from "lucide-react";
import { TaggingInput } from "./TaggingInput";
import { format } from "date-fns";
import { FilePreviewer } from "@/components/ui/FilePreviewer";
import { useSession } from "next-auth/react";

import { useVideoCall } from "@/contexts/video-call-context";

interface ChatWindowProps {
    onTagClick: (category: string, id: number) => void;
}

export function ChatWindow({ onTagClick }: ChatWindowProps) {
    const {
        activeRoom,
        setActiveRoom,
        messages,
        setMessages,
        sendMessage,
        isConnected,
        replyTo,
        setReplyTo,
        socket,
        groups,
        staff,
        updateMessage,
        deleteMessage
    } = useChat();
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [pollData, setPollData] = useState({ question: "", options: ["", ""] });
    const [openMenuId, setOpenMenuId] = useState<number | string | null>(null);
    const [previewFile, setPreviewFile] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startMeeting } = useVideoCall();

    const emojis = ["👍", "❤️", "😂", "😮", "😢", "🔥", "✅", "🙌", "✨", "🚀"];

    const addEmoji = (emoji: string) => {
        setInput((prev) => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploadedAttachments = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);

                const res = await fetch("/api/uploads/messaging", {
                    method: "POST",
                    body: formData,
                });
                const json = await res.json();
                if (json.success) {
                    uploadedAttachments.push(json.data);
                }
            }

            if (uploadedAttachments.length > 0) {
                await sendMessage("", uploadedAttachments);
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (!activeRoom) return;

        const params = activeRoom.type === "group"
            ? `groupId=${activeRoom.id}`
            : `receiverId=${activeRoom.id}`;

        fetch(`/api/chat/messages?${params}`)
            .then((res) => res.json())
            .then((json) => {
                if (json.success) setMessages(json.data);
            });
    }, [activeRoom, setMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const handleReactionAdded = (data: { messageId: number, reaction: any }) => {
            setMessages(prev => prev.map(m => {
                if (m.id === data.messageId) {
                    return { ...m, reactions: [...(m.reactions || []), data.reaction] };
                }
                return m;
            }));
        };

        const handlePollUpdated = (data: { pollId: number, poll: any }) => {
            setMessages(prev => prev.map(m => {
                if (m.poll?.id === data.pollId) {
                    return { ...m, poll: data.poll };
                }
                return m;
            }));
        };

        socket.on("reaction-added", handleReactionAdded);
        socket.on("poll-updated", handlePollUpdated);

        return () => {
            socket.off("reaction-added", handleReactionAdded);
            socket.off("poll-updated", handlePollUpdated);
        };
    }, [socket, setMessages]);

    const [editingMsgId, setEditingMsgId] = useState<number | string | null>(null);
    const [editInput, setEditInput] = useState("");
    const [forwardingMsg, setForwardingMsg] = useState<Message | null>(null);
    const [longPressTimer, setLongPressTimer] = useState<any>(null);

    const handleEdit = (msg: Message) => {
        setEditingMsgId(msg.id);
        setEditInput(msg.content);
        setOpenMenuId(null);
    };

    const submitEdit = async () => {
        if (!editingMsgId) return;
        await updateMessage(typeof editingMsgId === "string" ? parseInt(editingMsgId) : editingMsgId, editInput);
        setEditingMsgId(null);
        setEditInput("");
    };

    const handleDelete = async (msgId: number | string) => {
        if (confirm("Are you sure you want to delete this message?")) {
            await deleteMessage(typeof msgId === "string" ? parseInt(msgId) : msgId);
            setOpenMenuId(null);
        }
    };

    const handleForward = async (targetRoom: { type: "group" | "user", id: number }) => {
        if (!forwardingMsg) return;

        try {
            const res = await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId: targetRoom.type === "group" ? targetRoom.id : null,
                    receiverId: targetRoom.type === "user" ? targetRoom.id : null,
                    content: `[Forwarded]: ${forwardingMsg.content}`,
                    attachments: forwardingMsg.attachments,
                }),
            });
            const json = await res.json();
            if (json.success) {
                // If it's the current room, we'd see it, but we can just show a toast or something
                // For now, just close the modal
                setForwardingMsg(null);
            }
        } catch (error) {
            console.error("Forward failed:", error);
        }
    };

    // UI helper for long press
    const startLongPress = (msgId: number | string) => {
        const timer = setTimeout(() => {
            setOpenMenuId(msgId);
        }, 500);
        setLongPressTimer(timer);
    };

    const cancelLongPress = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    // ... handleFileUpload same ...

    const handleSend = async () => {
        if (!input.trim() && !replyTo) return;
        const content = input;
        const pId = replyTo?.id ? (typeof replyTo.id === "string" ? parseInt(replyTo.id) : replyTo.id) : undefined;
        setInput("");
        setReplyTo(null);
        await sendMessage(content, [], pId);
    };

    const handleReaction = async (messageId: number | string, emoji: string) => {
        try {
            const mid = typeof messageId === "string" ? parseInt(messageId) : messageId;
            const res = await fetch(`/api/chat/messages/${mid}/reactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emoji }),
            });
            const json = await res.json();
            if (json.success) {
                const roomKey = activeRoom?.type === "group" ? `group-${activeRoom.id}` : `user-${activeRoom!.id}`;
                socket?.emit("add-reaction", { roomId: roomKey, messageId: mid, reaction: json.data });

                setMessages(prev => prev.map(m => {
                    if (m.id === messageId) {
                        const existing = m.reactions?.find(r => r.emoji === emoji && r.staffId === json.data.staffId);
                        if (existing) return m;
                        return { ...m, reactions: [...(m.reactions || []), json.data] };
                    }
                    return m;
                }));
            }
        } catch (error) {
            console.error("Reaction failed:", error);
        }
    };

    const handleVote = async (pollId: number | string, optionId: number) => {
        try {
            const pid = typeof pollId === "string" ? parseInt(pollId) : pollId;
            const res = await fetch(`/api/chat/polls/${pid}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ optionIds: [optionId] }),
            });
            const json = await res.json();
            if (json.success) {
                const roomKey = activeRoom?.type === "group" ? `group-${activeRoom.id}` : `user-${activeRoom!.id}`;
                socket?.emit("update-poll", { roomId: roomKey, pollId: pid, poll: json.data });

                setMessages(prev => prev.map(m => {
                    if (m.poll?.id === pid) {
                        return { ...m, poll: json.data };
                    }
                    return m;
                }));
            }
        } catch (error) {
            console.error("Vote failed:", error);
        }
    };

    const createPoll = async () => {
        if (!pollData.question || pollData.options.some(o => !o)) return;
        try {
            const res = await fetch("/api/chat/polls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId: activeRoom?.type === "group" ? activeRoom.id : null,
                    receiverId: activeRoom?.type === "user" ? activeRoom.id : null,
                    question: pollData.question,
                    options: pollData.options
                }),
            });
            const json = await res.json();
            if (json.success) {
                setMessages(prev => [...prev, json.data]);

                // Also broadcast the message containing the poll
                const roomKey = activeRoom?.type === "group" ? `group-${activeRoom.id}` : `user-${activeRoom!.id}`;
                // This is a new message, so we should emit 'send-message'
                socket?.emit("send-message", {
                    ...json.data,
                    // Ensure the recipient room sees it
                });

                setShowPollModal(false);
                setPollData({ question: "", options: ["", ""] });
            }
        } catch (error) {
            console.error("Poll creation failed:", error);
        }
    };

    if (!activeRoom) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <Hash className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a channel or staff member to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {/* Back button on mobile */}
                    <button
                        onClick={() => setActiveRoom(null)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full md:hidden transition-colors"
                        aria-label="Back to channels"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-2">
                        {activeRoom.type === "group" ? (
                            <Hash className="h-5 w-5 text-gray-400" />
                        ) : (
                            activeRoom.avatarUrl ? (
                                <img src={activeRoom.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                            ) : (
                                <User className="h-5 w-5 text-gray-400" />
                            )
                        )}
                        <h2 className="font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                            {activeRoom.name || (activeRoom.type === "group" ? "Channel" : "Staff Member")}
                        </h2>
                        {!isConnected && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full uppercase font-bold">
                                Offline
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={() => {
                            const meetingId = Math.random().toString(36).substring(7);
                            sendMessage(`I've started a video meeting. Join here: [MEETING:${meetingId}:video]`, []);
                        }}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shrink-0"
                        title="Share Video Meeting"
                    >
                        <Video className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => {
                            const meetingId = Math.random().toString(36).substring(7);
                            sendMessage(`I've started an audio meeting. Join here: [MEETING:${meetingId}:audio]`, []);
                        }}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shrink-0"
                        title="Share Audio Meeting"
                    >
                        <Phone className="h-5 w-5" />
                    </button>
                    
                    {activeRoom.type === "group" && (
                        <button
                            onClick={() => setShowPollModal(true)}
                            className="hidden sm:flex text-xs font-bold text-gray-500 hover:text-black transition-colors items-center gap-1 border border-gray-200 px-2 py-1 rounded shrink-0"
                        >
                            <Plus className="h-3 w-3" />
                            Create Poll
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => {
                    const prevMsg = messages[idx - 1];
                    const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId;
                    const isOwn = msg.senderId === parseInt(session?.user?.id || "0");

                    return (
                        <div
                            key={msg.id}
                            className={`group relative flex flex-col ${showHeader ? "mt-4" : "mt-1"}`}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setOpenMenuId(msg.id);
                            }}
                            onTouchStart={() => startLongPress(msg.id)}
                            onTouchEnd={cancelLongPress}
                        >
                            {/* Reply Indicator in Feed */}
                            {msg.parentMessage && (
                                <div className="flex items-center gap-2 mb-1 pl-4 border-l-2 border-gray-200">
                                    <Reply className="h-3 w-3 text-gray-400" />
                                    <span className="text-[10px] text-gray-500 italic truncate">
                                        Replying to {msg.parentMessage.sender.firstName}: "{msg.parentMessage.content}"
                                    </span>
                                </div>
                            )}

                            <div className={`flex items-start gap-3 relative ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                {!isOwn && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-slate-500" />
                                    </div>
                                )}
                                <div className={`flex-1 flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                                    {showHeader && (
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">
                                                {msg.sender?.firstName} {msg.sender?.lastName}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {format(new Date(msg.createdAt), "HH:mm")}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`relative w-fit max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm transition-all shadow-sm ${isOwn ? "bg-slate-900 text-white rounded-tr-none ml-auto" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                        }`}>
                                        {/* 3 dots internal to bubble/close by */}
                                        <div className={`absolute top-1 ${isOwn ? "-left-6" : "-right-6"} md:opacity-0 group-hover:opacity-100 transition-opacity z-10 ${openMenuId === msg.id ? "opacity-100" : "opacity-40 md:opacity-0"}`}>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                                                    className="p-1.5 md:p-1 hover:bg-gray-100 rounded-full text-gray-400 bg-white border border-gray-200 shadow-sm transition-all active:scale-90"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>

                                                {openMenuId === msg.id && (
                                                    <div className={`absolute ${isOwn ? "right-0" : "left-0"} top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30`}>
                                                        <button
                                                            onClick={() => { setReplyTo(msg); setOpenMenuId(null); }}
                                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Reply className="h-3.5 w-3.5" /> Reply
                                                        </button>
                                                        <div className="border-t border-gray-100 my-1" />
                                                        <div className="px-3 py-1 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                                                            {emojis.slice(0, 6).map(e => (
                                                                <button
                                                                    key={e}
                                                                    onClick={() => { handleReaction(msg.id, e); setOpenMenuId(null); }}
                                                                    className="hover:scale-125 transition-transform text-sm p-1"
                                                                >
                                                                    {e}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="border-t border-gray-100 my-1" />
                                                        {isOwn && (
                                                            <button
                                                                onClick={() => handleEdit(msg)}
                                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" /> Edit
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => { setForwardingMsg(msg); setOpenMenuId(null); }}
                                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Forward className="h-3.5 w-3.5" /> Forward
                                                        </button>
                                                        {(isOwn || session?.user?.role === "MANAGER") && (
                                                            <button
                                                                onClick={() => handleDelete(msg.id)}
                                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {editingMsgId === msg.id ? (
                                            <div className="flex flex-col gap-2">
                                                <textarea
                                                    className="w-full bg-transparent border-none focus:ring-0 text-inherit resize-none p-0"
                                                    value={editInput}
                                                    onChange={(e) => setEditInput(e.target.value)}
                                                    rows={Math.min(5, editInput.split("\n").length)}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingMsgId(null)} className="text-[10px] opacity-70 hover:opacity-100 underline">Cancel</button>
                                                    <button onClick={submitEdit} className="text-[10px] font-bold underline">Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="leading-relaxed whitespace-pre-wrap break-words">
                                            {renderContent(msg.content, onTagClick, startMeeting)}
                                        </div>
                                        )}

                                        {/* Poll Display */}
                                        {msg.poll && (
                                            <div className={`mt-3 border rounded-lg p-4 max-w-sm ${isOwn ? "bg-white/10 border-white/20" : "bg-white border-gray-200"}`}>
                                                <h4 className="font-bold text-sm mb-3">📊 {msg.poll.question}</h4>
                                                <div className="space-y-2">
                                                    {msg.poll.options.map(opt => {
                                                        const totalVotes = msg.poll?.options.reduce((sum, o) => sum + o._count.votes, 0) || 0;
                                                        const percent = totalVotes > 0 ? (opt._count.votes / totalVotes) * 100 : 0;
                                                        return (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => handleVote(msg.poll!.id, opt.id)}
                                                                className={`w-full text-left relative overflow-hidden rounded border p-2 transition-colors ${isOwn ? "border-white/20 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                                                                    }`}
                                                            >
                                                                <div className={`absolute inset-0 h-full transition-all ${isOwn ? "bg-white/20" : "bg-black/5"}`} style={{ width: `${percent}%` }} />
                                                                <div className="relative flex justify-between text-[12px]">
                                                                    <span>{opt.text}</span>
                                                                    <span className="font-bold">{opt._count.votes}</span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {msg.attachments.map((at) => (
                                                    <div
                                                        key={at.id}
                                                        onClick={() => setPreviewFile(at)}
                                                        className={`flex items-center gap-2 p-2 rounded border hover:bg-white/5 text-[12px] cursor-pointer group/att ${isOwn ? "border-white/20" : "border-gray-200"
                                                            }`}
                                                    >
                                                        <Paperclip className="h-3 w-3" />
                                                        <span className="flex-1 truncate max-w-[150px]">{at.fileName}</span>
                                                        <Eye className="h-3 w-3 opacity-0 group-hover/att:opacity-100 transition-opacity" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Reactions list */}
                                    {msg.reactions && msg.reactions.length > 0 && (
                                        <div className={`flex flex-wrap gap-1 mt-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                                            {Object.entries(
                                                (msg.reactions || []).reduce((acc: Record<string, number>, r) => {
                                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                                    return acc;
                                                }, {})
                                            ).map(([emoji, count]) => (
                                                <span key={emoji} className={`rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 border ${isOwn ? "bg-white/10 border-white/20 text-white" : "bg-gray-50 border-gray-100 text-gray-500"
                                                    }`}>
                                                    {emoji} <span className="font-bold">{count}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {
                replyTo && (
                    <div className="mx-4 mt-2 p-2 bg-gray-50 border-l-4 border-black rounded flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Reply className="h-3 w-3 text-gray-400" />
                            <div className="text-[10px] truncate">
                                <span className="font-bold">Replying to {replyTo.sender?.firstName}:</span>
                                <span className="ml-1 text-gray-500 italic">{replyTo.content}</span>
                            </div>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-black mx-2">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )
            }

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
                <div className="relative bg-gray-50 rounded-lg border border-gray-300 focus-within:ring-1 focus-within:ring-black transition-all">
                    <TaggingInput
                        value={input}
                        onChange={setInput}
                        onEnter={handleSend}
                        placeholder={`Message ${activeRoom.type === "group" ? "#channel" : "@staff"}...`}
                    />
                    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-gray-400">
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="p-2 hover:text-black transition-colors"
                            >
                                <Paperclip className={`h-6 w-6 md:h-5 md:w-5 ${isUploading ? "animate-pulse" : ""}`} />
                            </button>
                            <div className="relative">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-xl grid grid-cols-5 md:grid-cols-8 gap-1 w-64 max-h-48 overflow-y-auto z-50">
                                        {emojis.map((emoji, i) => (
                                            <button
                                                key={i}
                                                onClick={() => addEmoji(emoji)}
                                                className="hover:bg-gray-100 p-2 md:p-1 rounded transition-colors text-xl md:text-lg"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2 hover:text-black transition-colors ${showEmojiPicker ? "text-black" : ""}`}
                                >
                                    <Smile className="h-6 w-6 md:h-5 md:w-5" />
                                </button>
                            </div>
                            <button
                                onClick={() => setInput((prev) => prev + "@")}
                                className="p-2 hover:text-black transition-colors"
                            >
                                <Tag className="h-6 w-6 md:h-5 md:w-5" />
                            </button>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() && !replyTo}
                            className="bg-black text-white p-2.5 md:p-1.5 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="h-5 w-5 md:h-4 md:w-4" />
                        </button>
                    </div>
                </div>
                <p className="mt-1.5 text-[10px] text-gray-400">
                    Tip: Use <b>@</b> to tag tasks, staff, or machines. <b>Enter</b> to send.
                </p>
            </div>

            {/* Poll Modal */}
            {
                showPollModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                            <h3 className="text-lg font-bold mb-4">Create a Poll</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        value={pollData.question}
                                        onChange={e => setPollData({ ...pollData, question: e.target.value })}
                                        placeholder="What do you think about...?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Options</label>
                                    {pollData.options.map((opt, idx) => (
                                        <input
                                            key={idx}
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                            value={opt}
                                            onChange={e => {
                                                const newOpts = [...pollData.options];
                                                newOpts[idx] = e.target.value;
                                                setPollData({ ...pollData, options: newOpts });
                                            }}
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                    ))}
                                    <button
                                        onClick={() => setPollData({ ...pollData, options: [...pollData.options, ""] })}
                                        className="text-xs text-blue-600 font-bold hover:underline"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => setShowPollModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createPoll}
                                    className="px-4 py-2 text-sm font-bold bg-black text-white rounded-md hover:bg-gray-800"
                                >
                                    Create Poll
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <FilePreviewer
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileUrl={previewFile?.fileUrl || ""}
                fileName={previewFile?.fileName || ""}
                mimeType={previewFile?.mimeType || ""}
            />

            {
                forwardingMsg && (
                    <ForwardModal
                        onClose={() => setForwardingMsg(null)}
                        onForward={handleForward}
                        groups={groups}
                        staff={staff}
                    />
                )
            }
        </div>
    );
}

function renderContent(content: string, onTagClick: (cat: string, id: number) => void, onJoinMeeting?: (id: string, type: 'video' | 'audio') => void) {
    // Meeting parsing: [MEETING:id:type]
    const meetingRegex = /\[MEETING:(.*?):(video|audio)\]/g;
    
    // Tag parsing: @[category:id](label)
    const tagRegex = /@\[(.*?):(.*?)]\((.*?)\)/g;
    
    let parts: any[] = [];
    let lastIndex = 0;
    
    // We combine regex search or handle them sequentially. Let's handle them one by one for simplicity if possible, or use a single replacement loop.
    // For now, let's just handle them as replacements.
    
    const combinedContent = content;
    
    // Simple meeting link block
    if (combinedContent.includes("[MEETING:")) {
        const match = meetingRegex.exec(combinedContent);
        if (match) {
            const [full, meetingId, type] = match;
            const before = combinedContent.split(full)[0];
            const after = combinedContent.split(full)[1];
            
            return (
                <div className="flex flex-col gap-2">
                    {before && <span>{before}</span>}
                    <div className="my-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-3 shadow-inner">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest">
                            {type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                            LAN Meeting Link
                        </div>
                        <button 
                            onClick={() => onJoinMeeting?.(meetingId, type as 'video' | 'audio')}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10"
                        >
                            <Plus className="h-4 w-4" />
                            Join Session
                        </button>
                    </div>
                    {after && <span>{after}</span>}
                </div>
            );
        }
    }

    // Fallback to tag parsing
    const parts_tag = [];
    lastIndex = 0;
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts_tag.push(content.substring(lastIndex, match.index));
        }
        const [full, category, id, label] = match;
        parts_tag.push(
            <button
                key={`${category}-${id}-${match.index}`}
                onClick={() => onTagClick(category, parseInt(id))}
                className="text-blue-600 font-bold hover:underline bg-blue-50/50 px-1 rounded mx-0.5"
            >
                @{label}
            </button>
        );
        lastIndex = tagRegex.lastIndex;
    }
    if (lastIndex < content.length) {
        parts_tag.push(content.substring(lastIndex));
    }

    return parts_tag.length > 0 ? parts_tag : content;
}

function ForwardModal({ onClose, onForward, groups, staff }: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredGroups = (groups || []).filter((g: any) => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredStaff = (staff || []).filter((s: any) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 font-outfit">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold">Forward Message</h3>
                    <button onClick={onClose}><X className="h-4 w-4" /></button>
                </div>
                <div className="p-3">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full p-2 text-sm border border-gray-200 rounded"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="mb-4">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">Channels</h4>
                        <div className="space-y-1">
                            {filteredGroups.map((g: any) => (
                                <button
                                    key={g.id}
                                    onClick={() => onForward({ type: "group", id: g.id })}
                                    className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2"
                                >
                                    <Hash className="h-4 w-4 text-gray-400" /> {g.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">Staff</h4>
                        <div className="space-y-1">
                            {filteredStaff.map((s: any) => (
                                <button
                                    key={s.id}
                                    onClick={() => onForward({ type: "user", id: s.id })}
                                    className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2"
                                >
                                    <User className="h-4 w-4 text-gray-400" /> {s.firstName} {s.lastName}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
