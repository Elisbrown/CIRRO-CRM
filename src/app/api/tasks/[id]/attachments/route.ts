import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]/attachments — List attachments for a task.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const attachments = await db.taskAttachment.findMany({
      where: { taskId: parseInt(id) },
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    return apiSuccess(attachments);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * POST /api/tasks/[id]/attachments — Upload file attachment.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error("[Upload Error] No active session");
      return apiError("Unauthorized", 401);
    }

    const { id } = await context.params;
    const taskId = parseInt(id);

    let formData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error("[Upload Error] Failed to parse form data:", err);
      return apiError("Invalid form data", 400);
    }

    const file = formData.get("file") as File | null;
    if (!file) return apiError("No file provided", 400);

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return apiError("File too large. Maximum 50MB allowed.", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/tasks/
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "tasks");

    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      console.error("[Upload Error] Failed to create directory:", err);
      return apiError("Server filesystem error", 500);
    }

    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadsDir, uniqueName);

    try {
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error("[Upload Error] Failed to write file:", err);
      return apiError("Failed to save file", 500);
    }

    const fileUrl = `/uploads/tasks/${uniqueName}`;

    const attachment = await db.taskAttachment.create({
      data: {
        taskId,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        uploadedById: session?.user?.id ? parseInt(session.user.id) : null,
      },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Log the upload
    await db.taskLog.create({
      data: {
        taskId,
        action: "ATTACHMENT_ADDED",
        details: `File "${file.name}" uploaded`,
        performedById: session?.user?.id ? parseInt(session.user.id) : null,
      },
    });

    return apiSuccess(attachment, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/tasks/[id]/attachments — Remove attachment.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) return apiError("attachmentId is required", 400);

    await db.taskAttachment.delete({ where: { id: parseInt(attachmentId) } });
    return apiSuccess({ message: "Attachment deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
