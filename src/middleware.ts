import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * RBAC middleware — protects authenticated routes and API endpoints.
 * Maps system roles to allowed URL patterns.
 *
 * Roles:
 *   MANAGER     — Full access (admin)
 *   ACCOUNTANT  — Dashboard, CRM, Suppliers, Catalog, Rent
 *   STAFF       — Tasks (default), CRM, Operations, Facility, Profile
 */

const ROLE_ROUTES: Record<string, RegExp[]> = {
  MANAGER: [/.*/], // Full access
  ACCOUNTANT: [
    /^\/dashboard/,
    /^\/contacts/,
    /^\/service-requests/,
    /^\/kanban/,
    /^\/suppliers/,
    /^\/catalog/,
    /^\/rent/,
    /^\/tasks/,
    /^\/profile/,
    /^\/messages/,
    /^\/api\/(chat|contacts|service-requests|suppliers|catalog|rent|tasks|search|staff\/lookup|uploads|dashboard)/,
  ],
  STAFF: [
    /^\/tasks/,
    /^\/contacts/,
    /^\/service-requests/,
    /^\/kanban/,
    /^\/catalog/,
    /^\/cleaning/,
    /^\/maintenance/,
    /^\/suppliers/,
    /^\/profile/,
    /^\/rent/,
    /^\/messages/,
    /^\/api\/(chat|tasks|contacts|service-requests|catalog|maintenance|suppliers|search|staff\/(lookup|upload)|uploads|rent|profile|machines)/,
  ],
};

/** Default landing page per role. */
const DEFAULT_PAGES: Record<string, string> = {
  MANAGER: "/dashboard",
  ACCOUNTANT: "/dashboard",
  STAFF: "/tasks",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico)$/) ||
    pathname.startsWith("/uploads") ||
    pathname === "/sw.js" ||
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
    // Redirect to default page for role
    const defaultPage = DEFAULT_PAGES[role] || "/tasks";
    return NextResponse.redirect(new URL(defaultPage, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|uploads|favicon.ico).*)"],
};
