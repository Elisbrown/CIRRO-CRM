import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { updateServiceRequestSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/service-requests/:id — Get SR with all relations.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sr = await db.serviceRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        contact: {
          select: {
            id: true,
            clientId: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
        service: { select: { id: true, serviceName: true, basePrice: true } },
        machine: { select: { id: true, name: true, model: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    if (!sr) return apiError("Service request not found", 404);

    // Calculate net profit
    const finalAmount = Number(sr.finalAmount || 0);
    const totalCost =
      Number(sr.supplyCost) + Number(sr.outsourceCost) + Number(sr.laborCost);
    const netProfit = finalAmount - totalCost;

    return apiSuccess({ ...sr, netProfit });
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * PUT /api/service-requests/:id — Update SR.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateServiceRequestSchema.parse(body);

    const existing = await db.serviceRequest.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) return apiError("Service request not found", 404);

    const sr = await db.serviceRequest.update({
      where: { id: parseInt(id) },
      data: {
        contactId: data.contactId,
        businessUnit: data.businessUnit,
        serviceId: data.serviceId,
        executionType: data.executionType,
        machineId: data.machineId,
        supplierId: data.supplierId,
        referralId: data.referralId,
        referralType: data.referralType,
        quotedAmount: data.quotedAmount,
        finalAmount: data.finalAmount,
        supplyCost: data.supplyCost,
        outsourceCost: data.outsourceCost,
        laborCost: data.laborCost,
        status: data.status,
        notes: data.notes,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        paperSize: data.paperSize,
        colorMode: data.colorMode,
        quantity: data.quantity,
        finishType: data.finishType,
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, companyName: true },
        },
      },
    });

    return apiSuccess(sr);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/service-requests/:id — Delete SR (only if DRAFT).
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sr = await db.serviceRequest.findUnique({
      where: { id: parseInt(id) },
    });
    if (!sr) return apiError("Service request not found", 404);

    if (sr.status !== "DRAFT" && sr.status !== "CANCELED") {
      return apiError("Only draft or canceled requests can be deleted", 400);
    }

    await db.serviceRequest.delete({ where: { id: parseInt(id) } });
    return apiSuccess({ message: "Service request deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
