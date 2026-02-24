import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, parsePaginationParams, handleValidationError } from "@/lib/api-utils";
import { createCleaningLogSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * GET /api/cleaning — List cleaning logs with filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(req);
    const url = new URL(req.url);
    const zone = url.searchParams.get("zone");
    const staffId = url.searchParams.get("staffId");

    const where: Prisma.CleaningLogWhereInput = {};
    if (zone) where.zone = zone as Prisma.EnumCleaningZoneFilter["equals"];
    if (staffId) where.staffId = parseInt(staffId);

    const [items, total] = await Promise.all([
      db.cleaningLog.findMany({
        where,
        include: {
          cleaner: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.cleaningLog.count({ where }),
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
 * POST /api/cleaning — Create a new cleaning log.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createCleaningLogSchema.parse(body);

    const log = await db.cleaningLog.create({
      data: {
        staffId: data.staffId,
        zone: data.zone,
        result: data.result,
        grade: data.grade,
        deduction: data.deduction,
        inspectorNotes: data.inspectorNotes,
      },
      include: {
        cleaner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(log, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
