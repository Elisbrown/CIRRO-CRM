import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, parsePaginationParams, handleValidationError } from "@/lib/api-utils";
import { createRentalSpaceSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * GET /api/rent/spaces — List rental spaces.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: Prisma.RentalSpaceWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tenantName: { contains: search } },
        { location: { contains: search } },
      ];
    }
    if (status) where.status = status as any;

    const [items, total] = await Promise.all([
      db.rentalSpace.findMany({
        where,
        include: {
          payments: {
            orderBy: { periodEnd: "desc" },
            take: 1,
          },
          _count: { select: { payments: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.rentalSpace.count({ where }),
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
 * POST /api/rent/spaces — Create a rental space.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createRentalSpaceSchema.parse(body);

    const space = await db.rentalSpace.create({
      data: {
        name: data.name,
        type: data.type,
        location: data.location,
        monthlyRent: data.monthlyRent,
        status: data.status,
        tenantName: data.tenantName,
        tenantPhone: data.tenantPhone,
        tenantEmail: data.tenantEmail,
        notes: data.notes,
      },
    });

    return apiSuccess(space, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
