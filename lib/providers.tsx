"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors
              const httpError = error as { status?: number };
              if (httpError?.status && httpError.status >= 400 && httpError.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "font-sans",
          style: {
            background: "#ffffff",
            color: "#1f2937",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "16px 20px",
            fontSize: "14px",
            fontWeight: "500",
            minWidth: "320px",
            maxWidth: "400px",
          },
          success: {
            duration: 3000,
            style: {
              background: "#ffffff",
              color: "#1f2937",
              border: "1px solid #3b82f6",
              borderLeft: "4px solid #3b82f6",
            },
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#ffffff",
              color: "#1f2937",
              border: "1px solid #ef4444",
              borderLeft: "4px solid #ef4444",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            style: {
              background: "#ffffff",
              color: "#1f2937",
              border: "1px solid #9ca3af",
              borderLeft: "4px solid #9ca3af",
            },
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
} 
