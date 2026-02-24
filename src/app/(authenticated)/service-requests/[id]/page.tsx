"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/**
 * Redirects /service-requests/[id] to /service-requests?edit=[id]
 * This ensures that links from external sources or breadcrumbs correctly open the drawer
 * on the main list page, as detail pages are managed via SlideDrawer.
 */
export default function ServiceRequestRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (id) {
      router.replace(`/service-requests?edit=${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Redirecting to service request...</p>
      </div>
    </div>
  );
}
