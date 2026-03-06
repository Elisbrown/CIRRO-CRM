import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    try {
        // 1. Get Group Unreads
        const memberships = await (prisma as any).chatGroupMember.findMany({
            where: { staffId: userId },
            select: { groupId: true, lastReadAt: true }
        });

        const groupUnreads: Record<string, number> = {};
        for (const membership of memberships) {
            const count = await prisma.chatMessage.count({
                where: {
                    groupId: membership.groupId,
                    createdAt: { gt: membership.lastReadAt },
                    senderId: { not: userId }
                }
            });
            groupUnreads[`group-${membership.groupId}`] = count;
        }

        // 2. Get Direct Message Unreads
        const directReads = await (prisma as any).chatDirectRead.findMany({
            where: { userId: userId },
        });

        const staff = await prisma.staff.findMany({
            where: { id: { not: userId } },
            select: { id: true }
        });

        const directUnreads: Record<string, number> = {};
        for (const person of staff) {
            const readRecord = directReads.find((r: any) => r.partnerId === person.id);
            const lastRead = readRecord ? readRecord.lastReadAt : new Date(0);

            const count = await prisma.chatMessage.count({
                where: {
                    senderId: person.id,
                    receiverId: userId,
                    createdAt: { gt: lastRead }
                }
            });
            directUnreads[`user-${person.id}`] = count;
        }

        return NextResponse.json({
            success: true,
            data: { ...groupUnreads, ...directUnreads }
        });
    } catch (error) {
        console.error("Failed to fetch unread counts:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}
