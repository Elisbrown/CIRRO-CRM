import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  parsePaginationParams,
  handleValidationError,
  generateDisplayId,
} from "@/lib/api-utils";
import { createServiceRequestSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * GET /api/service-requests — List with pagination, search, filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    const buFilter = url.searchParams.get("businessUnit");

    const where: Prisma.ServiceRequestWhereInput = {};

    if (search) {
      where.OR = [
        { requestId: { contains: search } },
        { notes: { contains: search } },
        { contact: { firstName: { contains: search } } },
        { contact: { lastName: { contains: search } } },
        { contact: { companyName: { contains: search } } },
      ];
    }

    if (statusFilter) where.status = statusFilter as Prisma.EnumServiceRequestStatusFilter["equals"];
    if (buFilter) where.businessUnit = buFilter as "OFFIZONE" | "JOYSUN";

    const [items, total] = await Promise.all([
      db.serviceRequest.findMany({
        where,
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true, companyName: true, clientId: true },
          },
          service: {
            select: { id: true, serviceName: true },
          },
          machine: {
            select: { id: true, name: true },
          },
          supplier: {
            select: { id: true, name: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.serviceRequest.count({ where }),
    ]);

    return apiSuccess({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * POST /api/service-requests — Create new SR.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createServiceRequestSchema.parse(body);
    const requestId = await generateDisplayId("SR", db.serviceRequest, 4);

    const sr = await db.serviceRequest.create({
      data: {
        requestId,
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

    return apiSuccess(sr, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
