import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { z } from "zod";

const updateSupplierSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.enum(["RAW_MATERIALS", "PRINTING_PARTNER", "MAINTENANCE", "CLEANING_SUPPLIES", "OTHER"]).optional(),
  contactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  bankDetails: z.string().optional().nullable(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/suppliers/:id — Get supplier detail with expense ledger.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supplier = await db.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        serviceRequests: {
          select: {
            id: true,
            requestId: true,
            businessUnit: true,
            status: true,
            outsourceCost: true,
            supplyCost: true,
            finalAmount: true,
            createdAt: true,
            contact: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        _count: { select: { serviceRequests: true } },
      },
    });

    if (!supplier) return apiError("Supplier not found", 404);

    // Calculate expense totals
    const totalOutsourceCost = supplier.serviceRequests.reduce(
      (sum, sr) => sum + Number(sr.outsourceCost),
      0
    );
    const totalSupplyCost = supplier.serviceRequests.reduce(
      (sum, sr) => sum + Number(sr.supplyCost),
      0
    );

    return apiSuccess({
      ...supplier,
      expenseSummary: {
        totalOutsourceCost,
        totalSupplyCost,
        totalExpenses: totalOutsourceCost + totalSupplyCost,
        jobCount: supplier._count.serviceRequests,
      },
    });
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/suppliers/:id — Update supplier.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateSupplierSchema.parse(body);

    const existing = await db.supplier.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return apiError("Supplier not found", 404);

    const supplier = await db.supplier.update({
      where: { id: parseInt(id) },
      data,
    });
    return apiSuccess(supplier);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/suppliers/:id — Delete supplier.
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supplier = await db.supplier.findUnique({ where: { id: parseInt(id) } });
    if (!supplier) return apiError("Supplier not found", 404);

    await db.supplier.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Supplier deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
