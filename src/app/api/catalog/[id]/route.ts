import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { z } from "zod";

const updateCatalogSchema = z.object({
  businessUnit: z.enum(["OFFIZONE", "JOYSUN"]).optional(),
  serviceName: z.string().min(1).max(200).optional(),
  basePrice: z.number().nonnegative().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateCatalogSchema.parse(body);
    const existing = await db.catalog.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return apiError("Catalog entry not found", 404);
    const entry = await db.catalog.update({ where: { id: parseInt(id) }, data });
    return apiSuccess(entry);
  } catch (error) {
    return handleValidationError(error);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.catalog.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Catalog entry deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
