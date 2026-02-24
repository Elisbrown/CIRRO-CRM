import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateTaskSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id] — Get single task with comments.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const task = await db.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!task) return apiError("Task not found", 404);
    return apiSuccess(task);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/tasks/[id] — Update a task.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateTaskSchema.parse(body);

    const updateData: any = { ...data };
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const task = await db.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(task);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/tasks/[id] — Delete a task.
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.task.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Task deleted successfully" });
  } catch (error) {
    return handleValidationError(error);
  }
}
