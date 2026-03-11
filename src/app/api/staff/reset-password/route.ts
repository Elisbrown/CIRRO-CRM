import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "MANAGER") {
    return apiError("Unauthorized. Managers only.", 401);
  }

  try {
    const { staffId, newPassword } = await req.json();

    if (!staffId || !newPassword) {
      return apiError("Staff ID and new password required", 400);
    }

    const passwordHash = await hash(newPassword, 12);

    await db.staff.update({
      where: { id: parseInt(staffId) },
      data: { passwordHash }
    });

    return apiSuccess({ message: "Password reset successful" });
  } catch (error) {
    return handleValidationError(error);
  }
}
