import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";

/**
 * GET /api/contacts/lookup — Lightweight contact list for dropdown selects.
 */
export async function GET() {
  try {
    const items = await db.contact.findMany({
      select: { id: true, firstName: true, lastName: true, companyName: true },
      orderBy: { firstName: "asc" },
      take: 200,
    });
    return apiSuccess(items);
  } catch (error) {
    return handleValidationError(error);
  }
}
