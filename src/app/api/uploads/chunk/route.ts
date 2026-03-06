import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { appendFile, mkdir, rename } from "fs/promises";
import path from "path";

/**
 * POST /api/uploads/chunk
 * Handles chunked file uploads.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return apiError("Unauthorized", 401);

        const formData = await req.formData();
        const chunk = formData.get("chunk") as File | null;
        const chunkIndex = parseInt(formData.get("chunkIndex") as string);
        const totalChunks = parseInt(formData.get("totalChunks") as string);
        const fileName = formData.get("fileName") as string;
        const taskId = parseInt(formData.get("taskId") as string);
        const uploadId = formData.get("uploadId") as string;

        if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId) {
            return apiError("Missing required chunk metadata", 400);
        }

        const tempDir = path.join(process.cwd(), "public", "uploads", "temp");
        await mkdir(tempDir, { recursive: true });

        const tempFilePath = path.join(tempDir, `${uploadId}.tmp`);
        const buffer = Buffer.from(await chunk.arrayBuffer());

        // Append this chunk to the temp file
        await appendFile(tempFilePath, buffer);

        // If this is the last chunk, finalize the file
        if (chunkIndex === totalChunks - 1) {
            const finalDir = path.join(process.cwd(), "public", "uploads", "tasks");
            await mkdir(finalDir, { recursive: true });

            const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;
            const finalFilePath = path.join(finalDir, uniqueName);

            // Move temp file to final destination
            await rename(tempFilePath, finalFilePath);

            const { size } = await (await import("fs/promises")).stat(finalFilePath);
            const fileUrl = `/uploads/tasks/${uniqueName}`;

            const attachment = await db.taskAttachment.create({
                data: {
                    taskId,
                    fileName,
                    fileUrl,
                    fileSize: Number(size),
                    mimeType: chunk.type || "application/octet-stream",
                    uploadedById: parseInt(session.user.id),
                },
                include: {
                    uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                },
            });

            // Log the upload
            await db.taskLog.create({
                data: {
                    taskId,
                    action: "ATTACHMENT_ADDED",
                    details: `File "${fileName}" uploaded via chunked transfer`,
                    performedById: parseInt(session.user.id),
                },
            });

            return apiSuccess(attachment, 201);
        }

        return apiSuccess({ message: "Chunk uploaded", chunkIndex }, 200);
    } catch (error) {
        console.error("[Chunk Upload Error]:", error);
        return handleValidationError(error);
    }
}
