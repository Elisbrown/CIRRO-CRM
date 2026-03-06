import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const messageId = parseInt(id);
    const { emoji } = await req.json();

    if (!emoji) {
        return NextResponse.json({ success: false, error: "Emoji is required" }, { status: 400 });
    }

    try {
        const reaction = await prisma.chatMessageReaction.upsert({
            where: {
                messageId_staffId_emoji: {
                    messageId,
                    staffId: userId,
                    emoji
                }
            },
            update: {},
            create: {
                messageId,
                staffId: userId,
                emoji
            }
        });

        return NextResponse.json({ success: true, data: reaction });
    } catch (error) {
        console.error("Reaction failed:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const messageId = parseInt(id);
    const { emoji } = await req.json();

    try {
        await prisma.chatMessageReaction.delete({
            where: {
                messageId_staffId_emoji: {
                    messageId,
                    staffId: userId,
                    emoji
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete reaction failed:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
