import { type NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Standard API response wrapper for consistent JSON structure.
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Parse pagination + search params from request URL.
 */
export function parsePaginationParams(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25")));
  const search = url.searchParams.get("search") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = (url.searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const skip = (page - 1) * limit;

  return { page, limit, search, sortBy, sortOrder, skip };
}

/**
 * User-friendly error messages by category.
 * Raw technical errors (Prisma, Zod, etc.) are mapped to clean messages.
 */
function formatPrismaError(error: Prisma.PrismaClientKnownRequestError): { message: string; status: number } {
  switch (error.code) {
    case "P2002": {
      const fields = (error.meta?.target as string[]) || [];
      const fieldNames = fields.map((f) => f.replace(/_/g, " ")).join(", ");
      return {
        message: `A record with this ${fieldNames || "value"} already exists. Please use a different value.`,
        status: 409,
      };
    }
    case "P2003":
      return {
        message: "This record is linked to other data. Please check related records before making changes.",
        status: 400,
      };
    case "P2025":
      return {
        message: "The record you're trying to update or delete no longer exists.",
        status: 404,
      };
    case "P2014":
      return {
        message: "This change would break a required relationship. Please check the linked records.",
        status: 400,
      };
    default:
      return {
        message: "Something went wrong while saving to the database. Please try again.",
        status: 500,
      };
  }
}

function formatZodErrors(error: ZodError): string {
  const fieldErrors = error.issues.map((issue) => {
    const field = issue.path.length > 0
      ? issue.path.map((p) => String(p).replace(/_/g, " ")).join(" → ")
      : "input";

    switch ((issue as any).code) {
      case "invalid_type": {
        const _issue = issue as any;
        if (_issue.received === "undefined" || _issue.received === "null") {
          return `${field} is required`;
        }
        return `${field} must be a valid ${_issue.expected}`;
      }
      case "too_small":
        return `${field} is required`;
      case "too_big":
        return `${field} is too long`;
      case "invalid_enum_value":
        return `${field}: invalid option selected`;
      case "invalid_string": {
        const _issue = issue as any;
        if (_issue.validation === "email") return `Please enter a valid email address`;
        return `${field} is not valid`;
      }
      default:
        return `${field}: ${issue.message}`;
    }
  });

  // Deduplicate and limit to 3 most relevant errors
  const unique = [...new Set(fieldErrors)];
  if (unique.length <= 3) {
    return unique.join(". ") + ".";
  }
  return unique.slice(0, 3).join(". ") + `. And ${unique.length - 3} more issue(s).`;
}

/**
 * Central error handler for all API routes.
 * Converts raw errors to user-friendly messages.
 */
export function handleValidationError(error: unknown) {
  // Log the full error for debugging (server-side only)
  console.error("[API Error]", error);

  // Zod validation errors → field-specific messages
  if (error instanceof ZodError) {
    return apiError(formatZodErrors(error), 422);
  }

  // Prisma known request errors → friendly DB messages
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { message, status } = formatPrismaError(error);
    return apiError(message, status);
  }

  // Prisma validation errors (unknown fields, type mismatches)
  if (error instanceof Prisma.PrismaClientValidationError) {
    return apiError(
      "Some of the provided data is invalid. Please check your inputs and try again.",
      400
    );
  }

  // Generic Error instances
  if (error instanceof Error) {
    // Don't leak internal error messages to client
    const safeMessage =
      error.message.includes("prisma") || error.message.includes("TURBOPACK")
        ? "An unexpected error occurred. Please try again."
        : error.message;
    return apiError(safeMessage, 500);
  }

  return apiError("An unexpected error occurred. Please try again.", 500);
}

/**
 * Generate sequential display IDs (E-001, C-0001, SR-0001).
 */
export async function generateDisplayId(
  prefix: string,
  model: { count: () => Promise<number> },
  padLength = 3
) {
  const count = await model.count();
  return `${prefix}-${String(count + 1).padStart(padLength, "0")}`;
}
