import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, parsePaginationParams, handleValidationError } from "@/lib/api-utils";
import { createMaintenanceLogSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * GET /api/maintenance — List maintenance logs.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(req);
    const url = new URL(req.url);
    const machineId = url.searchParams.get("machineId");

    const where: Prisma.MaintenanceLogWhereInput = {};
    if (machineId) where.machineId = parseInt(machineId);

    const [items, total] = await Promise.all([
      db.maintenanceLog.findMany({
        where,
        include: {
          machine: {
            select: { id: true, name: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.maintenanceLog.count({ where }),
    ]);

    return apiSuccess({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * POST /api/maintenance — Create a new maintenance log.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createMaintenanceLogSchema.parse(body);

    const log = await db.maintenanceLog.create({
      data: {
        machineId: data.machineId,
        action: data.action,
        cost: data.cost,
        status: data.status,
      },
      include: {
        machine: {
          select: { id: true, name: true },
        },
      },
    });

    // Update the machine's last maintenance date and status
    await db.machine.update({
      where: { id: data.machineId },
      data: {
        status: data.status,
        lastMaintenanceDate: new Date(),
      },
    });

    return apiSuccess(log, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
