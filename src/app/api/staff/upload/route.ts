import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, handleValidationError } from "@/lib/api-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const staffId = formData.get("staffId") as string | null;

    if (!file) return apiError("No file provided", 400);
    if (!staffId) return apiError("Staff ID is required", 400);

    const sId = parseInt(staffId);
    const staff = await db.staff.findUnique({ where: { id: sId } });
    if (!staff) return apiError("Staff member not found", 404);

    if (file.size > MAX_FILE_SIZE) {
      return apiError("File size exceeds 5 MB limit", 400);
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const baseName = `avatar_${sId}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, baseName);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const avatarUrl = `/uploads/avatars/${baseName}`;

    // Update staff record
    const updatedStaff = await db.staff.update({
      where: { id: sId },
      data: { avatarUrl },
    });

    return apiSuccess(updatedStaff, 200);
  } catch (error) {
    return handleValidationError(error);
  }
}
