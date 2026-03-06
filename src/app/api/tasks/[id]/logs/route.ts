import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]/logs — List activity logs for a task.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const logs = await db.taskLog.findMany({
      where: { taskId: parseInt(id) },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        performedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    return apiSuccess(logs);
  } catch (error) {
    return handleValidationError(error);
  }
}
