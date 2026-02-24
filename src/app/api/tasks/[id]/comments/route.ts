import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";
import { createTaskCommentSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tasks/[id]/comments — Add a comment to a task.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = createTaskCommentSchema.parse(body);

    const comment = await db.taskComment.create({
      data: {
        taskId: parseInt(id),
        authorId: parseInt(session.user.id),
        content: data.content,
      },
    });

    return apiSuccess(comment, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
