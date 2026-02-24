import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, parsePaginationParams, handleValidationError } from "@/lib/api-utils";
import { createTaskSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * GET /api/tasks — List tasks with filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const assignedTo = url.searchParams.get("assignedTo");
    const relatedRecordId = url.searchParams.get("relatedRecordId");
    const relatedType = url.searchParams.get("relatedType");

    const where: Prisma.TaskWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) where.status = status as Prisma.EnumTaskStatusFilter["equals"];
    if (assignedTo) where.assignedTo = parseInt(assignedTo);
    if (relatedRecordId && relatedType) {
      where.relatedRecordId = parseInt(relatedRecordId);
      where.relatedType = relatedType;
    }

    const [items, total] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.task.count({ where }),
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
 * POST /api/tasks — Create a new task.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createTaskSchema.parse(body);

    const taskData: any = {
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      priority: data.priority,
      status: data.status,
      relatedRecordId: data.relatedRecordId,
      relatedType: data.relatedType,
    };

    if (data.dueDate) {
      taskData.dueDate = new Date(data.dueDate);
    }

    const task = await db.task.create({
      data: taskData,
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(task, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
