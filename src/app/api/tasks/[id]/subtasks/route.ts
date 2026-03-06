import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { createSubTaskSchema, updateSubTaskSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]/subtasks — List sub-tasks for a task.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const subTasks = await db.subTask.findMany({
      where: { taskId: parseInt(id) },
      orderBy: { sortOrder: "asc" },
    });
    return apiSuccess(subTasks);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * POST /api/tasks/[id]/subtasks — Create a sub-task.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = createSubTaskSchema.parse(body);
    const taskId = parseInt(id);

    // Get next sort order
    const maxOrder = await db.subTask.findFirst({
      where: { taskId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const subTask = await db.subTask.create({
      data: {
        taskId,
        title: data.title,
        isCompleted: data.isCompleted,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });

    return apiSuccess(subTask, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/tasks/[id]/subtasks — Batch update sub-tasks (toggle, reorder).
 * Body: { subtaskId: number, ...updateFields }
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const body = await req.json();
    const { subtaskId, ...updateFields } = body;

    if (!subtaskId) return apiError("subtaskId is required", 400);

    const data = updateSubTaskSchema.parse(updateFields);
    const subTask = await db.subTask.update({
      where: { id: subtaskId },
      data,
    });

    return apiSuccess(subTask);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/tasks/[id]/subtasks — Delete a sub-task.
 * Body: { subtaskId: number }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subtaskId = searchParams.get("subtaskId");

    if (!subtaskId) return apiError("subtaskId is required", 400);

    await db.subTask.delete({ where: { id: parseInt(subtaskId) } });
    return apiSuccess({ message: "Sub-task deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
