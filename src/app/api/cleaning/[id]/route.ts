import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateCleaningLogSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/cleaning/[id] — Get cleaning log details.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const log = await db.cleaningLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        cleaner: {
          select: { id: true, firstName: true, lastName: true, department: true },
        },
      },
    });

    if (!log) return apiError("Cleaning log not found", 404);
    return apiSuccess(log);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/cleaning/[id] — Update cleaning log.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateCleaningLogSchema.parse(body);

    const log = await db.cleaningLog.update({
      where: { id: parseInt(id) },
      data,
      include: {
        cleaner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(log);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/cleaning/[id] — Delete cleaning log.
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.cleaningLog.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Cleaning log deleted successfully" });
  } catch (error) {
    return handleValidationError(error);
  }
}
