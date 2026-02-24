import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * RBAC middleware — protects authenticated routes and API endpoints.
 * Maps system roles to allowed URL patterns.
 */

const ROLE_ROUTES: Record<string, RegExp[]> = {
  SUPER_ADMIN: [/.*/], // Full access
  OPERATIONS_MANAGER: [
    /^\/dashboard/,
    /^\/tasks/,
    /^\/maintenance/,
    /^\/cleaning/,
    /^\/suppliers/,
    /^\/machines/,
    /^\/staff/,
    /^\/api\/(tasks|maintenance|cleaning|suppliers|machines|staff|search)/,
  ],
  SALES_REP: [
    /^\/dashboard/,
    /^\/contacts/,
    /^\/leads/,
    /^\/service-requests/,
    /^\/api\/(contacts|service-requests|search|catalog)/,
  ],
  ASSISTANT: [
    /^\/dashboard/,
    /^\/tasks/,
    /^\/cleaning/,
    /^\/maintenance/,
    /^\/api\/(tasks|cleaning|maintenance)/,
  ],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check auth
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC check for protected routes
  const role = req.auth.user?.role as string;
  const allowedPatterns = ROLE_ROUTES[role] || [];
  const isAllowed = allowedPatterns.some((pattern) => pattern.test(pathname));

  if (!isAllowed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
