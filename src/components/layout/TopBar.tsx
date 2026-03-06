"use client";

import { useSession, signOut } from "next-auth/react";
import { useUIStore } from "@/stores/ui-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function TopBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = session?.user?.name
    ? session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6" suppressHydrationWarning>
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-4" suppressHydrationWarning>
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 md:hidden"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest hidden md:inline">Cirronyx CRM</span>
      </div>

      {/* Right: Profile Only */}
      <div className="flex items-center gap-2" suppressHydrationWarning>
        {mounted && (
          <div ref={profileRef} className="relative" suppressHydrationWarning>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
            >
              {session?.user?.image ? (
                <div className="h-8 w-8 rounded-full border border-gray-200 overflow-hidden bg-gray-50" suppressHydrationWarning>
                  <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold text-white" suppressHydrationWarning>
                  {initials}
                </div>
              )}
              {session?.user?.name && (
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-medium text-gray-700 leading-none">
                    {session.user.name}
                  </p>
                </div>
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg animate-fade-in">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  My Profile
                </Link>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
