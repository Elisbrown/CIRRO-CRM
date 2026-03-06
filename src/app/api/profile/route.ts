import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateProfileSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";

/**
 * GET /api/profile — Get current user profile.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const staff = await db.staff.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        staffId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        avatarUrl: true,
        bio: true,
        address: true,
        createdAt: true,
      },
    });

    if (!staff) return apiError("Profile not found", 404);
    return apiSuccess(staff);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/profile — Update own profile (staff self-service).
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const updateData: any = { ...data };
    if (data.password) {
      updateData.passwordHash = await hash(data.password, 12);
      delete updateData.password;
    }

    const staff = await db.staff.update({
      where: { id: parseInt(session.user.id) },
      data: updateData,
      select: {
        id: true,
        staffId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        avatarUrl: true,
        bio: true,
        address: true,
      },
    });

    return apiSuccess(staff);
  } catch (error) {
    return handleValidationError(error);
  }
}
