import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return apiError("Unauthorized", 401);
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return apiError("No file provided", 400);
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = join(process.cwd(), "public", "uploads", "messaging");

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/messaging/${fileName}`;

        return apiSuccess({
            fileName: file.name,
            fileUrl,
            fileSize: file.size,
            mimeType: file.type || "application/octet-stream"
        });
    } catch (error) {
        console.error("Upload error:", error);
        return apiError("Upload failed", 500);
    }
}
