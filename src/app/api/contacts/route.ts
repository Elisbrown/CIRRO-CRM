import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  parsePaginationParams,
  handleValidationError,
  generateDisplayId,
} from "@/lib/api-utils";
import { createContactSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * GET /api/contacts — List contacts with pagination, search, filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);
    const url = new URL(req.url);
    const typeFilter = url.searchParams.get("type"); // LEAD | CUSTOMER
    const statusFilter = url.searchParams.get("status");

    const where: Prisma.ContactWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
        { clientId: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (typeFilter) where.type = typeFilter as "LEAD" | "CUSTOMER";
    if (statusFilter) where.status = statusFilter as Prisma.EnumLeadStatusFilter["equals"];

    const [contacts, total] = await Promise.all([
      db.contact.findMany({
        where,
        include: {
          assignedRep: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.contact.count({ where }),
    ]);

    return apiSuccess({
      items: contacts,
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
 * POST /api/contacts — Create new contact.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createContactSchema.parse(body);
    const clientId = await generateDisplayId("C", db.contact, 4);

    const contact = await db.contact.create({
      data: {
        ...data,
        clientId,
        email: data.email || null,
      },
      include: {
        assignedRep: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(contact, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
