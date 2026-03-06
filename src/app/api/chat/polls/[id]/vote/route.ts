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
    const pollId = parseInt(id);
    const { optionIds } = await req.json(); // Array of option IDs to vote for

    if (!optionIds || !Array.isArray(optionIds)) {
        return NextResponse.json({ success: false, error: "OptionIds array required" }, { status: 400 });
    }

    try {
        const poll = await prisma.chatPoll.findUnique({
            where: { id: pollId },
            include: { options: { select: { id: true } } }
        });

        if (!poll) {
            return NextResponse.json({ success: false, error: "Poll not found" }, { status: 404 });
        }

        const validOptionIds = poll.options.map((o: { id: number }) => o.id);
        const filteredOptionIds = optionIds.filter(id => validOptionIds.includes(id));

        // Use a transaction to update votes
        await prisma.$transaction(async (tx) => {
            // Remove existing votes for this poll by this user
            const currentVotes = await tx.chatPollVote.findMany({
                where: {
                    staffId: userId,
                    option: { pollId }
                }
            });

            if (currentVotes.length > 0) {
                await tx.chatPollVote.deleteMany({
                    where: { id: { in: currentVotes.map((v: { id: number }) => v.id) } }
                });
            }

            // Create new votes
            if (filteredOptionIds.length > 0) {
                await tx.chatPollVote.createMany({
                    data: filteredOptionIds.map(oId => ({
                        optionId: oId,
                        staffId: userId
                    }))
                });
            }
        });

        // Return updated poll data
        const updatedPoll = await prisma.chatPoll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    include: {
                        _count: { select: { votes: true } }
                    }
                }
            }
        });

        return NextResponse.json({ success: true, data: updatedPoll });
    } catch (error) {
        console.error("Poll vote failed:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
