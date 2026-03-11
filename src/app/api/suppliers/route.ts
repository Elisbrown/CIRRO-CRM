import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  parsePaginationParams,
  handleValidationError,
} from "@/lib/api-utils";
import { createSupplierSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * GET /api/suppliers — List with pagination, search, category filter.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);
    const category = new URL(req.url).searchParams.get("category");
    const isServiceProvider = new URL(req.url).searchParams.get("isServiceProvider");

    const where: Prisma.SupplierWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (category) where.category = category as Prisma.EnumSupplierCategoryFilter["equals"];
    if (isServiceProvider) where.isServiceProvider = isServiceProvider === "true";

    const [items, total] = await Promise.all([
      db.supplier.findMany({
        where,
        include: {
          _count: { select: { serviceRequests: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.supplier.count({ where }),
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
 * POST /api/suppliers — Create new supplier.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSupplierSchema.parse(body);

    const supplier = await db.supplier.create({ data });
    return apiSuccess(supplier, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
