"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/stores/ui-store";
import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Droplets,
  FileText,
  Home,
  Kanban,
  LayoutDashboard,
  Printer,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  UserSquare,
  Wrench,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Contacts", href: "/contacts", icon: Users, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SALES_REP"] },
      { label: "Service Requests", href: "/service-requests", icon: FileText, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SALES_REP"] },
      { label: "Workflow Board", href: "/kanban", icon: Kanban, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SALES_REP"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Suppliers", href: "/suppliers", icon: Truck, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER"] },
      { label: "Catalog", href: "/catalog", icon: ShoppingBag, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SALES_REP"] },
      { label: "Machines", href: "/machines", icon: Printer, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER"] },
    ],
  },
  {
    label: "Facility",
    items: [
      { label: "Cleaning Logs", href: "/cleaning", icon: Droplets, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "ASSISTANT"] },
      { label: "Maintenance", href: "/maintenance", icon: Wrench, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER", "ASSISTANT"] },
    ],
  },
  {
    label: "HR & Admin",
    items: [
      { label: "Staff", href: "/staff", icon: UserSquare, roles: ["SUPER_ADMIN", "OPERATIONS_MANAGER"] },
      { label: "Settings", href: "/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const userRole = session?.user?.role || "ASSISTANT";

  // Close sidebar on mobile by default after mounting
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Initialize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
          sidebarOpen 
            ? "w-64 translate-x-0" 
            : "w-[68px] -translate-x-full md:translate-x-0 md:w-[68px]"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-4 overflow-hidden">
          <Link href="/dashboard" className="flex items-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Cirronyx"
              className={`h-8 object-contain object-left transition-all duration-300 ${
                sidebarOpen ? "w-[120px]" : "w-[32px]"
              }`}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.roles || item.roles.includes(userRole)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} className="mb-6">
                {sidebarOpen && (
                  <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (window.innerWidth < 768) toggleSidebar();
                          }}
                          className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-black text-white"
                              : "text-gray-600 hover:bg-gray-100 hover:text-black"
                          }`}
                          title={!sidebarOpen ? item.label : undefined}
                        >
                          <Icon
                            className={`h-5 w-5 shrink-0 ${
                              isActive ? "text-white" : "text-gray-400 group-hover:text-black"
                            }`}
                          />
                          <span className={`transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 md:hidden"}`}>
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle (Desktop only) */}
        <div className="hidden border-t border-gray-200 p-3 md:block">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
