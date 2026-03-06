import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";

/**
 * GET /api/staff/performance — Staff performance overview.
 * Returns each staff member with task stats and performance rating.
 */
export async function GET(_req: NextRequest) {
  try {
    const staffList = await db.staff.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        staffId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        avatarUrl: true,
        _count: {
          select: {
            assignedTasks: true,
          },
        },
      },
    });

    const now = new Date();
    const performances = await Promise.all(
      staffList.map(async (staff) => {
        const [total, completed, overdue, pending, nearingDeadline] = await Promise.all([
          db.task.count({ where: { assignedTo: staff.id } }),
          db.task.count({ where: { assignedTo: staff.id, status: "DONE" } }),
          db.task.count({
            where: {
              assignedTo: staff.id,
              status: { notIn: ["DONE"] },
              dueDate: { lt: now },
            },
          }),
          db.task.count({
            where: { assignedTo: staff.id, status: "PENDING_APPROVAL" },
          }),
          db.task.count({
            where: {
              assignedTo: staff.id,
              status: { notIn: ["DONE"] },
              dueDate: {
                gte: now,
                lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
              },
            },
          }),
        ]);

        // Get overdue task details
        const overdueTasks = await db.task.findMany({
          where: {
            assignedTo: staff.id,
            status: { notIn: ["DONE"] },
            dueDate: { lt: now },
          },
          select: { id: true, title: true, dueDate: true, priority: true },
          orderBy: { dueDate: "asc" },
          take: 5,
        });

        // Performance rating: 0-100
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        const overdueRate = total > 0 ? (overdue / total) * 100 : 0;
        const rating = Math.max(0, Math.min(100, Math.round(completionRate - overdueRate * 0.5)));

        return {
          ...staff,
          tasks: { total, completed, overdue, pending, nearingDeadline },
          overdueTasks,
          performanceRating: rating,
        };
      })
    );

    return apiSuccess(performances);
  } catch (error) {
    return handleValidationError(error);
  }
}
