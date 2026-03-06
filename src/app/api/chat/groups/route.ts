import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Ensure "#General" group exists
    let generalGroup = await prisma.chatGroup.findFirst({
        where: { id: 1 }
    });

    if (!generalGroup) {
        generalGroup = await prisma.chatGroup.create({
            data: {
                id: 1,
                name: "#General",
                description: "Official company-wide chat room.",
                isPrivate: false,
            }
        });

        // Auto-add all existing staff to General
        const allStaff = await prisma.staff.findMany();
        await prisma.chatGroupMember.createMany({
            data: allStaff.map((s: any) => ({
                groupId: 1,
                staffId: s.id,
                isAdmin: s.role === "MANAGER"
            })),
            skipDuplicates: true
        });
    }

    // Fetch groups where user is a member or public groups
    const groups = await prisma.chatGroup.findMany({
        where: {
            OR: [
                { isPrivate: false },
                { members: { some: { staffId: userId } } }
            ]
        },
        include: {
            members: {
                where: { staffId: userId }
            },
            _count: {
                select: { members: true }
            }
        },
        orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ success: true, data: groups });
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { name, description, isPrivate, members } = await req.json();

    if (!name) {
        return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const group = await prisma.chatGroup.create({
        data: {
            name,
            description,
            isPrivate: !!isPrivate,
            creatorId: userId,
            members: {
                create: [
                    { staffId: userId, isAdmin: true },
                    ...(members || []).map((id: number) => ({ staffId: id, isAdmin: false }))
                ]
            }
        },
        include: {
            members: true
        }
    });

    return NextResponse.json({ success: true, data: group });
}
