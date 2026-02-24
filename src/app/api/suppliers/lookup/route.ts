import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";

/**
 * GET /api/suppliers/lookup — Lightweight supplier list for dropdowns.
 */
export async function GET() {
  try {
    const items = await db.supplier.findMany({
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    });
    return apiSuccess(items);
  } catch (error) {
    return handleValidationError(error);
  }
}
