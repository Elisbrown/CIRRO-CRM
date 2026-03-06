import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateRentalSpaceSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/rent/spaces/[id] — Get single space with payments.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const space = await db.rentalSpace.findUnique({
      where: { id: parseInt(id) },
      include: {
        payments: { orderBy: { periodEnd: "desc" } },
        _count: { select: { payments: true } },
      },
    });
    if (!space) return apiError("Space not found", 404);
    return apiSuccess(space);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/rent/spaces/[id] — Update a rental space.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateRentalSpaceSchema.parse(body);

    const space = await db.rentalSpace.update({
      where: { id: parseInt(id) },
      data,
    });
    return apiSuccess(space);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/rent/spaces/[id] — Delete a rental space.
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.rentalSpace.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Space deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
