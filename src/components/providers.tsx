"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode, useEffect } from "react";
import { ToastProvider, useToast } from "@/components/ui/Toast";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Bridge component to connect global QueryClient errors to the Toast system.
 * We use this separate component because useToast() must be used within ToastProvider.
 */
function QueryErrorBridge({ children, queryClient }: { children: ReactNode; queryClient: QueryClient }) {
  const { toast } = useToast();

  useEffect(() => {
    // We set up the error handling using the query/mutation cache subscribe method.
    // This catches all errors globally in one place.
    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") {
        const error = event.action.error;
        if (error instanceof Error) {
          toast("error", "Error", error.message);
        }
      }
    });

    const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") {
        const error = event.action.error;
        if (error instanceof Error) {
          toast("error", "Error", error.message);
        }
      }
    });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient, toast]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            // We disable retry by default to avoid multiple toasts for the same error
            retry: false,
          },
          mutations: {
            retry: false,
          }
        },
      })
  );

  return (
    <SessionProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <QueryErrorBridge queryClient={queryClient}>
            {children}
          </QueryErrorBridge>
        </QueryClientProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
