import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateMaintenanceLogSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/maintenance/[id] — Get maintenance log details.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const log = await db.maintenanceLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        machine: {
          select: { id: true, name: true, model: true },
        },
      },
    });

    if (!log) return apiError("Maintenance log not found", 404);
    return apiSuccess(log);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/maintenance/[id] — Update maintenance log.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateMaintenanceLogSchema.parse(body);

    const log = await db.maintenanceLog.update({
      where: { id: parseInt(id) },
      data,
      include: {
        machine: {
          select: { id: true, name: true },
        },
      },
    });

    // If status changed, update machine status too
    if (data.status) {
      await db.machine.update({
        where: { id: log.machineId },
        data: { status: data.status },
      });
    }

    return apiSuccess(log);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/maintenance/[id] — Delete maintenance log.
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.maintenanceLog.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Maintenance log deleted successfully" });
  } catch (error) {
    return handleValidationError(error);
  }
}
