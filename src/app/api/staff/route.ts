import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import {
  apiSuccess,
  apiError,
  parsePaginationParams,
  handleValidationError,
  generateDisplayId,
} from "@/lib/api-utils";
import { createStaffSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * GET /api/staff — List staff with pagination, search, sorting.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);

    const where: Prisma.StaffWhereInput = search
      ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { staffId: { contains: search } },
          { phone: { contains: search } },
        ],
      }
      : {};

    const [staff, total] = await Promise.all([
      db.staff.findMany({
        where,
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
          avatarUrl: true,
          createdAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.staff.count({ where }),
    ]);

    return apiSuccess({
      items: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * POST /api/staff — Create new staff member.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createStaffSchema.parse(body);
    const { password, ...staffData } = data;

    const existing = await db.staff.findUnique({ where: { email: data.email } });
    if (existing) return apiError("Email already in use", 409);

    const staffId = await generateDisplayId("E", db.staff);
    const passwordHash = await hash(password, 12);

    const staff = await db.staff.create({
      data: {
        ...staffData,
        staffId,
        passwordHash,
      },
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
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Auto-join to #General group (ID: 1)
    try {
      await db.chatGroupMember.create({
        data: {
          groupId: 1,
          staffId: staff.id,
          isAdmin: staff.role === "MANAGER"
        }
      });
    } catch (e) {
      console.error("Failed to auto-join staff to General group:", e);
    }

    return apiSuccess(staff, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
