import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await req.json();
    const userId = parseInt(session.user.id);

    const message = await prisma.chatMessage.findUnique({
        where: { id: parseInt(id) }
    });

    if (!message || message.senderId !== userId) {
        return NextResponse.json({ success: false, error: "Not found or forbidden" }, { status: 403 });
    }

    const updated = await prisma.chatMessage.update({
        where: { id: parseInt(id) },
        data: { content },
        include: {
            sender: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true }
            },
            attachments: true,
            reactions: {
                include: {
                    staff: { select: { firstName: true, lastName: true } }
                }
            },
            poll: {
                include: {
                    options: {
                        include: {
                            _count: { select: { votes: true } }
                        }
                    }
                }
            },
            parentMessage: {
                include: {
                    sender: { select: { firstName: true, lastName: true } }
                }
            },
            _count: {
                select: { replies: true }
            }
        }
    });

    return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(session.user.id);

    const message = await prisma.chatMessage.findUnique({
        where: { id: parseInt(id) }
    });

    // Only sender or a manager can delete
    const isManager = session.user.role === "MANAGER";
    if (!message || (message.senderId !== userId && !isManager)) {
        return NextResponse.json({ success: false, error: "Not found or forbidden" }, { status: 403 });
    }

    await prisma.chatMessage.delete({
        where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
}
