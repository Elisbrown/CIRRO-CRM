import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const supplierId = searchParams.get("supplierId");

  if (!supplierId) return apiError("Supplier ID required", 400);

  try {
    const jobs = await db.jobLog.findMany({
      where: { supplierId: parseInt(supplierId) },
      include: {
        loggedBy: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { jobDate: "desc" }
    });
    return apiSuccess(jobs);
  } catch (error) {
    return handleValidationError(error);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  try {
    const { supplierId, description, cost, jobDate } = await req.json();
    
    const user = await db.staff.findUnique({
      where: { email: session.user?.email || "" }
    });

    if (!user) return apiError("User not found", 404);

    const job = await db.jobLog.create({
      data: {
        supplierId: parseInt(supplierId),
        description,
        cost: parseFloat(cost),
        jobDate: jobDate ? new Date(jobDate) : new Date(),
        loggedById: user.id
      }
    });

    return apiSuccess(job, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
