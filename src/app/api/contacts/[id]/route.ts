import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateContactSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contacts/:id — Get single contact with relations.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const contact = await db.contact.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignedRep: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        serviceRequests: {
          select: {
            id: true,
            requestId: true,
            businessUnit: true,
            status: true,
            finalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            staff: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { serviceRequests: true, activities: true },
        },
      },
    });

    if (!contact) return apiError("Contact not found", 404);
    return apiSuccess(contact);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/contacts/:id — Update contact.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateContactSchema.parse(body);

    const existing = await db.contact.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return apiError("Contact not found", 404);

    const contact = await db.contact.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        email: data.email || null,
      },
      include: {
        assignedRep: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(contact);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/contacts/:id — Hard delete contact.
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const contact = await db.contact.findUnique({ where: { id: parseInt(id) } });
    if (!contact) return apiError("Contact not found", 404);

    await db.contact.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Contact deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
