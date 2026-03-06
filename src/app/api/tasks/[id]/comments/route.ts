import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";
import { createTaskCommentSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]/comments — List comments for a task.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const comments = await db.taskComment.findMany({
      where: { taskId: parseInt(id) },
      orderBy: { createdAt: "asc" },
    });
    return apiSuccess(comments);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * POST /api/tasks/[id]/comments — Add a comment.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const { id } = await context.params;
    const body = await req.json();
    const data = createTaskCommentSchema.parse(body);
    const taskId = parseInt(id);

    const comment = await db.taskComment.create({
      data: {
        taskId,
        authorId: session?.user?.id ? parseInt(session.user.id) : 0,
        content: data.content,
      },
    });

    // Log the comment
    await db.taskLog.create({
      data: {
        taskId,
        action: "COMMENT_ADDED",
        details: `Comment added`,
        performedById: session?.user?.id ? parseInt(session.user.id) : null,
      },
    });

    return apiSuccess(comment, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
