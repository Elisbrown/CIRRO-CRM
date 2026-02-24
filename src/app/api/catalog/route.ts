import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, parsePaginationParams, handleValidationError } from "@/lib/api-utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const createCatalogSchema = z.object({
  businessUnit: z.enum(["OFFIZONE", "JOYSUN"]),
  serviceName: z.string().min(1, "Service name is required").max(200),
  basePrice: z.number().nonnegative("Price must be >= 0"),
});

/**
 * GET /api/catalog — List all catalog items (with optional pagination).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paginated = url.searchParams.has("page");

    if (!paginated) {
      // Simple list for dropdowns
      const items = await db.catalog.findMany({
        select: { id: true, serviceName: true, businessUnit: true, basePrice: true },
        orderBy: { serviceName: "asc" },
      });
      return apiSuccess(items);
    }

    // Admin paginated view
    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);
    const buFilter = url.searchParams.get("businessUnit");

    const where: Prisma.CatalogWhereInput = {};
    if (search) where.serviceName = { contains: search };
    if (buFilter) where.businessUnit = buFilter as "OFFIZONE" | "JOYSUN";

    const [items, total] = await Promise.all([
      db.catalog.findMany({
        where,
        include: { _count: { select: { serviceRequests: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.catalog.count({ where }),
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
 * POST /api/catalog — Create catalog entry.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createCatalogSchema.parse(body);
    const entry = await db.catalog.create({ data });
    return apiSuccess(entry, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
