import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { groupId, receiverId, question, options, isMultiple } = await req.json();

    if (!question || !options || options.length < 2) {
        return NextResponse.json({ success: false, error: "Question and at least 2 options required" }, { status: 400 });
    }

    try {
        // Create the poll and its options
        const poll = await prisma.chatPoll.create({
            data: {
                question,
                isMultiple: !!isMultiple,
                options: {
                    create: options.map((opt: string) => ({ text: opt }))
                }
            },
            include: {
                options: true
            }
        });

        // Create a message that references this poll
        const message = await prisma.chatMessage.create({
            data: {
                groupId: groupId ? parseInt(groupId) : null,
                receiverId: receiverId ? parseInt(receiverId) : null,
                senderId: userId,
                content: `POLL: ${question}`, // Fallback text
                pollId: poll.id
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, avatarUrl: true }
                },
                poll: {
                    include: {
                        options: {
                            include: {
                                _count: { select: { votes: true } }
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({ success: true, data: message });
    } catch (error) {
        console.error("Poll creation failed:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
