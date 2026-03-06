import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const receiverId = searchParams.get("receiverId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const cursor = searchParams.get("cursor");

    const userId = parseInt(session.user.id);

    const where: any = {};
    if (groupId) {
        where.groupId = parseInt(groupId);
    } else if (receiverId) {
        where.OR = [
            { senderId: userId, receiverId: parseInt(receiverId) },
            { senderId: parseInt(receiverId), receiverId: userId }
        ];
    } else {
        return NextResponse.json({ success: false, error: "GroupId or ReceiverId is required" }, { status: 400 });
    }

    const messages = await prisma.chatMessage.findMany({
        where,
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: parseInt(cursor) } : undefined,
        orderBy: { createdAt: "desc" },
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

    return NextResponse.json({
        success: true,
        data: messages.reverse(),
        nextCursor: messages.length === limit ? messages[0].id : null
    });
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { groupId, receiverId, content, parentMessageId, attachments } = await req.json();

    if (!content && (!attachments || attachments.length === 0)) {
        return NextResponse.json({ success: false, error: "Content or attachments required" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
        data: {
            groupId: groupId ? parseInt(groupId) : null,
            receiverId: receiverId ? parseInt(receiverId) : null,
            senderId: userId,
            content,
            parentMessageId: parentMessageId ? parseInt(parentMessageId) : null,
            attachments: {
                create: (attachments || []).map((a: any) => ({
                    fileName: a.fileName,
                    fileUrl: a.fileUrl,
                    fileSize: a.fileSize,
                    mimeType: a.mimeType
                }))
            }
        },
        include: {
            sender: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true }
            },
            attachments: true
        }
    });

    // Note: Broadcasting will be handled by the client emitting to socket 
    // after this API call returns successfully.

    return NextResponse.json({ success: true, data: message });
}
