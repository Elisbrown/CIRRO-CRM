import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateStaffSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/staff/:id — Get single staff member with related data.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const staff = await db.staff.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        staffId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedContacts: true,
            assignedTasks: true,
            cleaningLogs: true,
          },
        },
      },
    });

    if (!staff) return apiError("Staff not found", 404);
    return apiSuccess(staff);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/staff/:id — Update staff member.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateStaffSchema.parse(body);

    const existing = await db.staff.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return apiError("Staff not found", 404);

    // Check email uniqueness if changed
    if (data.email && data.email !== existing.email) {
      const emailTaken = await db.staff.findUnique({ where: { email: data.email } });
      if (emailTaken) return apiError("Email already in use", 409);
    }

    const { password, ...updateData } = data;
    const finalData: Record<string, unknown> = { ...updateData };
    if (password) {
      finalData.passwordHash = await hash(password, 12);
    }

    const staff = await db.staff.update({
      where: { id: parseInt(id) },
      data: finalData,
      select: {
        id: true,
        staffId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return apiSuccess(staff);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/staff/:id — Soft-delete (set inactive) or hard-delete staff.
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const staff = await db.staff.findUnique({ where: { id: parseInt(id) } });
    if (!staff) return apiError("Staff not found", 404);

    // Soft delete — mark inactive
    await db.staff.update({
      where: { id: parseInt(id) },
      data: { status: "INACTIVE" },
    });

    return apiSuccess({ message: "Staff member deactivated" });
  } catch (error) {
    return handleValidationError(error);
  }
}
