import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/uploads — Handle file uploads for service requests.
 * Saves files to public/uploads and records in FileAttachment table.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const serviceRequestId = formData.get("serviceRequestId") as string | null;

    if (!file) return apiError("No file provided", 400);
    if (!serviceRequestId) return apiError("Service request ID is required", 400);

    const srId = parseInt(serviceRequestId);
    const sr = await db.serviceRequest.findUnique({ where: { id: srId } });
    if (!sr) return apiError("Service request not found", 404);

    if (file.size > MAX_FILE_SIZE) {
      return apiError("File size exceeds 10 MB limit", 400);
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Save to database
    const attachment = await db.fileAttachment.create({
      data: {
        serviceRequestId: srId,
        fileName: file.name,
        fileUrl: `/uploads/${uniqueName}`,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      },
    });

    return apiSuccess(attachment, 201);
  } catch (error) {
    return handleValidationError(error);
  }
}

/**
 * GET /api/uploads?serviceRequestId=N — List attachments for a service request.
 */
export async function GET(req: NextRequest) {
  try {
    const srId = req.nextUrl.searchParams.get("serviceRequestId");
    if (!srId) return apiError("serviceRequestId is required", 400);

    const attachments = await db.fileAttachment.findMany({
      where: { serviceRequestId: parseInt(srId) },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(attachments);
  } catch (error) {
    return handleValidationError(error);
  }
}
