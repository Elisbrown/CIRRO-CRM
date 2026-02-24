import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { z } from "zod";

const updateMachineSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  model: z.string().optional().nullable(),
  status: z.enum(["OPERATIONAL", "NEEDS_PARTS", "DOWN"]).optional(),
  lastMaintenanceDate: z.string().optional().nullable(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateMachineSchema.parse(body);
    const existing = await db.machine.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return apiError("Machine not found", 404);

    const { lastMaintenanceDate, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    if (lastMaintenanceDate !== undefined) {
      updateData.lastMaintenanceDate = lastMaintenanceDate ? new Date(lastMaintenanceDate) : null;
    }

    const machine = await db.machine.update({ where: { id: parseInt(id) }, data: updateData });
    return apiSuccess(machine);
  } catch (error) {
    return handleValidationError(error);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.machine.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Machine deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
