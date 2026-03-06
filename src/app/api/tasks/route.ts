import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, parsePaginationParams, handleValidationError } from "@/lib/api-utils";
import { createTaskSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";

/**
 * GET /api/tasks — List tasks with filters.
 * Staff role: only sees own tasks. Manager/Accountant: sees all.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { page, limit, search, sortBy, sortOrder, skip } = parsePaginationParams(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const assignedTo = url.searchParams.get("assignedTo");
    const priority = url.searchParams.get("priority");
    const relatedRecordId = url.searchParams.get("relatedRecordId");
    const relatedType = url.searchParams.get("relatedType");

    const where: Prisma.TaskWhereInput = {};

    // Staff can only see their own tasks
    if (session?.user && (session.user.role as any) === "STAFF") {
      const userId = (session.user as any).id;
      if (userId) {
        where.assignedTo = parseInt(userId);
      }
    } else if (assignedTo) {
      where.assignedTo = parseInt(assignedTo);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) where.status = status as any;
    if (priority) where.priority = priority as any;
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
          creator: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: { select: { comments: true, subTasks: true, attachments: true } } as any,
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
    const session = await auth();
    const body = await req.json();
    const data = createTaskSchema.parse(body);

    const creatorId = session?.user?.id ? parseInt(session.user.id) : null;

    const taskBaseData: any = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      relatedRecordId: data.relatedRecordId || null,
      relatedType: data.relatedType || null,
      isRecurring: data.isRecurring,
      recurringInterval: data.recurringInterval || null,
      recurringDays: data.recurringDays || null,
    };

    if (creatorId) {
      taskBaseData.creator = { connect: { id: creatorId } };
    }

    if (data.dueDate) {
      taskBaseData.dueDate = new Date(data.dueDate);
    }

    if (data.isGeneral) {
      // Get all active staff members
      const allStaff = await db.staff.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
      });

      const tasks = await Promise.all(
        allStaff.map(async (staff) => {
          const t = await db.task.create({
            data: {
              ...taskBaseData,
              assignee: { connect: { id: staff.id } },
              isGeneral: true,
            },
          });

          if ((db as any).taskLog) {
            await (db as any).taskLog.create({
              data: {
                taskId: t.id,
                action: "CREATED",
                details: `General task "${t.title}" created for staff #${staff.id}`,
                performedById: session?.user?.id ? parseInt(session.user.id) : null,
              },
            });
          }
          return t;
        })
      );

      // Return a simulated task object for the client to handle
      return apiSuccess({ id: 0, title: data.title, isGeneral: true, count: tasks.length }, 201);
    }

    const finalTaskData = {
      ...taskBaseData,
      isGeneral: false,
    };

    if (data.assignedTo) {
      (finalTaskData as any).assignee = { connect: { id: data.assignedTo } };
    }

    const task = await db.task.create({
      data: finalTaskData as any,
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Create task log
    if ((db as any).taskLog) {
      await (db as any).taskLog.create({
        data: {
          taskId: task.id,
          action: "CREATED",
          details: `Task "${task.title}" created`,
          performedById: session?.user?.id ? parseInt(session.user.id) : null,
        },
      });
    }

    return apiSuccess(task, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}
