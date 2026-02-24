import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";

/**
 * GET /api/staff/lookup — Lightweight staff list for referral popup.
 */
export async function GET() {
  try {
    const items = await db.staff.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true, department: true },
      orderBy: { firstName: "asc" },
    });
    return apiSuccess(items);
  } catch (error) {
    return handleValidationError(error);
  }
}
