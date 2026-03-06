import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, handleValidationError } from "@/lib/api-utils";
import { addDays, addWeeks, addMonths } from "date-fns";

/**
 * POST /api/tasks/recurring — Generate recurring task instances.
 * Call this via cron or on page load to auto-create new task instances.
 */
export async function POST(_req: NextRequest) {
  try {
    const now = new Date();

    // Find all recurring parent tasks
    const recurringTasks = await db.task.findMany({
      where: {
        isRecurring: true,
        recurringInterval: { not: null },
      },
    });

    let created = 0;

    for (const parent of recurringTasks) {
      // Find the most recent child (or use parent creation date)
      const lastChild = await db.task.findFirst({
        where: { recurringParentId: parent.id },
        orderBy: { createdAt: "desc" },
      });

      const lastDate = lastChild?.createdAt || parent.createdAt;
      let nextDate: Date;

      switch (parent.recurringInterval) {
        case "DAILY":
          nextDate = addDays(lastDate, 1);
          break;
        case "WEEKLY":
          nextDate = addWeeks(lastDate, 1);
          break;
        case "MONTHLY":
          nextDate = addMonths(lastDate, 1);
          break;
        case "CUSTOM":
          nextDate = addDays(lastDate, parent.recurringDays || 1);
          break;
        default:
          continue;
      }

      // Only create if the next date has passed
      if (nextDate <= now) {
        // Calculate due date offset from parent
        let dueDate: Date | null = null;
        if (parent.dueDate) {
          const offset = parent.dueDate.getTime() - parent.createdAt.getTime();
          dueDate = new Date(now.getTime() + offset);
        }

        await db.task.create({
          data: {
            title: parent.title,
            description: parent.description,
            assignedTo: parent.assignedTo,
            createdById: parent.createdById,
            priority: parent.priority,
            status: "TODO",
            dueDate,
            relatedRecordId: parent.relatedRecordId,
            relatedType: parent.relatedType,
            recurringParentId: parent.id,
          },
        });

        created++;
      }
    }

    return apiSuccess({ message: `${created} recurring task(s) generated`, created });
  } catch (error) {
    return handleValidationError(error);
  }
}
