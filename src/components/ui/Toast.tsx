"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
}

/* ─── Context ────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

/** Hook to trigger toasts from anywhere in the app. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ─── Styling ────────────────────────────────────────────── */

const config: Record<ToastType, { bg: string; border: string; icon: typeof AlertCircle; iconColor: string }> = {
  success: { bg: "bg-white", border: "border-emerald-200", icon: CheckCircle, iconColor: "text-emerald-500" },
  error:   { bg: "bg-white", border: "border-red-200",     icon: AlertCircle, iconColor: "text-red-500" },
  warning: { bg: "bg-white", border: "border-amber-200",   icon: AlertTriangle, iconColor: "text-amber-500" },
  info:    { bg: "bg-white", border: "border-blue-200",    icon: Info,        iconColor: "text-blue-500" },
};

/* ─── Provider ───────────────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container — fixed in top-right */}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const c = config[t.type];
          const Icon = c.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-[360px] items-start gap-3 rounded-lg border ${c.border} ${c.bg} p-4 shadow-lg animate-in slide-in-from-right`}
              role="alert"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${c.iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                {t.message && (
                  <p className="mt-0.5 text-sm text-gray-500 leading-snug">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="mt-0.5 shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
