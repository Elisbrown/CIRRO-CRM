import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { createContactAttachmentSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contacts/[id]/attachments — List notes & files for a contact.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const attachments = await db.contactAttachment.findMany({
      where: { contactId: parseInt(id) },
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
 * POST /api/contacts/[id]/attachments — Add a note or file.
 * For notes: JSON { type: "NOTE", title, content }
 * For files: multipart form with file + optional title
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const { id } = await context.params;
    const contactId = parseInt(id);
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // File upload
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const title = formData.get("title") as string | null;

      if (!file) return apiError("No file provided", 400);
      if (file.size > 50 * 1024 * 1024) return apiError("File too large. Max 50MB.", 400);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads", "contacts");
      await mkdir(uploadsDir, { recursive: true });

      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadsDir, uniqueName);
      await writeFile(filePath, buffer);

      const attachment = await db.contactAttachment.create({
        data: {
          contactId,
          type: "FILE",
          title: title || file.name,
          fileName: file.name,
          fileUrl: `/uploads/contacts/${uniqueName}`,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          uploadedById: session?.user?.id ? parseInt(session.user.id) : null,
        },
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      return apiSuccess(attachment, 201);
    } else {
      // JSON note
      const body = await req.json();
      const data = createContactAttachmentSchema.parse(body);

      const attachment = await db.contactAttachment.create({
        data: {
          contactId,
          type: data.type || "NOTE",
          title: data.title,
          content: data.content,
          uploadedById: session?.user?.id ? parseInt(session.user.id) : null,
        },
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Also create an Activity record so it shows up in the timeline
      if (attachment.type === "NOTE") {
        await db.activity.create({
          data: {
            type: "note",
            content: attachment.content || attachment.title || "New note added",
            contactId,
            staffId: attachment.uploadedById,
          },
        });
      }

      return apiSuccess(attachment, 201);
    }
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * DELETE /api/contacts/[id]/attachments — Delete an attachment.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) return apiError("attachmentId is required", 400);

    await db.contactAttachment.delete({ where: { id: parseInt(attachmentId) } });
    return apiSuccess({ message: "Attachment deleted" });
  } catch (error) {
    return handleValidationError(error);
  }
}
