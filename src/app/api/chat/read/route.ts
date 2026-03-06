import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await req.json();
    const userId = parseInt(session.user.id);

    try {
        if (type === "group") {
            await (prisma as any).chatGroupMember.updateMany({
                where: {
                    groupId: parseInt(id),
                    staffId: userId,
                },
                data: {
                    lastReadAt: new Date(),
                },
            });
        } else if (type === "user") {
            await (prisma as any).chatDirectRead.upsert({
                where: {
                    userId_partnerId: {
                        userId: userId,
                        partnerId: parseInt(id),
                    },
                },
                update: {
                    lastReadAt: new Date(),
                },
                create: {
                    userId: userId,
                    partnerId: parseInt(id),
                    lastReadAt: new Date(),
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update read status:", error);
        return NextResponse.json({ success: false, error: "Database update failed" }, { status: 500 });
    }
}
