import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, parsePaginationParams, handleValidationError } from "@/lib/api-utils";
import { createRentPaymentSchema } from "@/lib/validations";

/**
 * GET /api/rent/payments — List rent payments.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, sortOrder, skip } = parsePaginationParams(req);
    const url = new URL(req.url);
    const spaceId = url.searchParams.get("spaceId");

    const where: any = {};
    if (spaceId) where.spaceId = parseInt(spaceId);

    const [items, total] = await Promise.all([
      db.rentPayment.findMany({
        where,
        include: {
          space: { select: { id: true, name: true, type: true } },
        },
        orderBy: { paidAt: sortOrder },
        skip,
        take: limit,
      }),
      db.rentPayment.count({ where }),
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
 * POST /api/rent/payments — Record a rent payment.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createRentPaymentSchema.parse(body);

    const payment = await db.rentPayment.create({
      data: {
        spaceId: data.spaceId,
        amount: data.amount,
        paidAt: new Date(data.paidAt),
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        paymentMethod: data.paymentMethod,
        receiptNumber: data.receiptNumber,
        notes: data.notes,
      },
      include: {
        space: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(payment, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
