"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useUIStore } from "@/stores/ui-store";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <Sidebar />
      <div
        className={`transition-all duration-300 ease-in-out ${sidebarOpen ? "md:ml-64" : "md:ml-[68px]"
          }`}
        suppressHydrationWarning
      >
        <TopBar />
        <main className="p-4 md:p-6" suppressHydrationWarning>{children}</main>
      </div>
    </div>
  );
}
