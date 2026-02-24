import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, parsePaginationParams, handleValidationError } from "@/lib/api-utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const createMachineSchema = z.object({
  name: z.string().min(1, "Machine name is required").max(200),
  model: z.string().optional().nullable(),
  status: z.enum(["OPERATIONAL", "NEEDS_PARTS", "DOWN"]).default("OPERATIONAL"),
});

/**
 * GET /api/machines — List machines (simple or paginated).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paginated = url.searchParams.has("page");

    if (!paginated) {
      const items = await db.machine.findMany({
        select: { id: true, name: true, model: true, status: true },
        orderBy: { name: "asc" },
      });
      return apiSuccess(items);
    }

    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);
    const statusFilter = url.searchParams.get("status");

    const where: Prisma.MachineWhereInput = {};
    if (search) where.name = { contains: search };
    if (statusFilter) where.status = statusFilter as Prisma.EnumMachineStatusFilter["equals"];

    const [items, total] = await Promise.all([
      db.machine.findMany({
        where,
        include: {
          _count: { select: { serviceRequests: true, maintenanceLogs: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.machine.count({ where }),
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
 * POST /api/machines — Create new machine.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createMachineSchema.parse(body);
    const machine = await db.machine.create({ data });
    return apiSuccess(machine, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
