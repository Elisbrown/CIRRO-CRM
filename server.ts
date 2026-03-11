import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"],
        },
    });

    // userId -> socketId
    const onlineUsers = new Map<string, string>();
    // socketId -> userId (for quick reverse lookup on disconnect)
    const socketToUser = new Map<string, string>();
    // user statuses: 'online', 'busy', 'offline' (manual)
    const userStatuses = new Map<string, string>();

    const broadcastStatus = () => {
        const statusList = Array.from(onlineUsers.keys()).map(userId => ({
            userId: parseInt(userId),
            status: userStatuses.get(userId) || 'online'
        }));
        io.emit("status-update", statusList);
    };

    io.on("connection", (socket) => {
        console.log("New client connected", socket.id);

        socket.on("user-connected", (userId: string) => {
            onlineUsers.set(userId, socket.id);
            socketToUser.set(socket.id, userId);
            if (!userStatuses.has(userId)) {
                userStatuses.set(userId, 'online');
            }
            console.log(`User ${userId} connected as ${socket.id}`);
            broadcastStatus();
        });

        socket.on("update-user-status", ({ userId, status }: { userId: string, status: string }) => {
            userStatuses.set(userId, status);
            broadcastStatus();
        });

        socket.on("join-room", (roomId: string) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on("leave-room", (roomId: string) => {
            socket.leave(roomId);
            console.log(`Socket ${socket.id} left room ${roomId}`);
        });

        socket.on("send-message", async (data: any) => {
            try {
                if (data.groupId) {
                    socket.to(`group-${data.groupId}`).emit("new-message", data);
                } else if (data.receiverId) {
                    socket.to(`user-${data.receiverId}`).emit("new-message", data);
                }
            } catch (error) {
                console.error("Socket message error:", error);
            }
        });

        socket.on("message-deleted", (data: { roomId: string, messageId: number }) => {
            socket.to(data.roomId).emit("message-deleted", data);
        });

        socket.on("message-updated", (data: { roomId: string, message: any }) => {
            socket.to(data.roomId).emit("message-updated", data);
        });

        socket.on("add-reaction", (data: { roomId: string, messageId: number, reaction: any }) => {
            socket.to(data.roomId).emit("reaction-added", data);
        });

        socket.on("remove-reaction", (data: { roomId: string, messageId: number, reaction: any }) => {
            socket.to(data.roomId).emit("reaction-removed", data);
        });

        socket.on("update-poll", (data: { roomId: string, pollId: number, poll: any }) => {
            socket.to(data.roomId).emit("poll-updated", data);
        });

        socket.on("group-created", (group: any) => {
            io.emit("group-created", group);
        });

        // WebRTC Signaling
        socket.on("call-user", (data: { to: string, offer: any, fromName: string, type: 'video' | 'audio' }) => {
            console.log(`Call from ${socketToUser.get(socket.id)} to ${data.to}`);
            socket.to(`user-${data.to}`).emit("incoming-call", {
                from: socketToUser.get(socket.id),
                fromName: data.fromName,
                offer: data.offer,
                type: data.type
            });
        });

        socket.on("make-answer", (data: { to: string, answer: any }) => {
            socket.to(`user-${data.to}`).emit("call-answered", {
                from: socketToUser.get(socket.id),
                answer: data.answer
            });
        });

        socket.on("ice-candidate", (data: { to: string, candidate: any }) => {
            socket.to(`user-${data.to}`).emit("ice-candidate", {
                from: socketToUser.get(socket.id),
                candidate: data.candidate
            });
        });

        socket.on("reject-call", (data: { to: string }) => {
            socket.to(`user-${data.to}`).emit("call-rejected", {
                from: socketToUser.get(socket.id)
            });
        });

        socket.on("end-call", (data: { to: string }) => {
            socket.to(`user-${data.to}`).emit("call-ended", {
                from: socketToUser.get(socket.id)
            });
        });

        socket.on("disconnect", () => {
            const userId = socketToUser.get(socket.id);
            if (userId) {
                onlineUsers.delete(userId);
                socketToUser.delete(socket.id);
                console.log(`User ${userId} disconnected`);
                broadcastStatus();
            }
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
