import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateTaskSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id] — Get single task with all relations.
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
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
        approver: {
          select: { id: true, firstName: true, lastName: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            task: false,
          },
        },
        subTasks: {
          orderBy: { sortOrder: "asc" },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        logs: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            performedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        _count: { select: { comments: true, subTasks: true, attachments: true } },
      },
    });

    if (!task) return apiError("Task not found", 404);
    return apiSuccess(task);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/tasks/[id] — Update a task with approval workflow.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const { id } = await context.params;
    const body = await req.json();
    const data = updateTaskSchema.parse(body);
    const taskId = parseInt(id);

    // Get current task state for logging
    const currentTask = await db.task.findUnique({ where: { id: taskId } });
    if (!currentTask) return apiError("Task not found", 404);

    const updateData: any = { ...data };
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const userRole = session?.user?.role;
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    // Staff/Accountant cannot set status to DONE directly — must go through PENDING_APPROVAL
    if (userRole !== "MANAGER" && data.status === "DONE") {
      updateData.status = "PENDING_APPROVAL";
    }

    // Manager approving a task (PENDING_APPROVAL → DONE or any → DONE)
    if (
      userRole === "MANAGER" &&
      data.status === "DONE" &&
      currentTask.status !== "DONE"
    ) {
      updateData.approvedById = userId;
      updateData.approvedAt = new Date();
      updateData.completedAt = new Date();
    }

    // Track completion when marking as PENDING_APPROVAL
    if (data.status === "PENDING_APPROVAL" && currentTask.status !== "PENDING_APPROVAL") {
      updateData.completedAt = new Date();
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Create log for status changes
    if (data.status && data.status !== currentTask.status) {
      await db.taskLog.create({
        data: {
          taskId,
          action: data.status === "DONE" ? "APPROVED" : "STATUS_CHANGED",
          details: `Status changed from ${currentTask.status} to ${data.status}`,
          performedById: userId,
        },
      });
    }

    // Create log for assignment changes
    if (data.assignedTo !== undefined && data.assignedTo !== currentTask.assignedTo) {
      await db.taskLog.create({
        data: {
          taskId,
          action: "ASSIGNED",
          details: data.assignedTo
            ? `Task assigned to staff #${data.assignedTo}`
            : "Task unassigned",
          performedById: userId,
        },
      });
    }

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
