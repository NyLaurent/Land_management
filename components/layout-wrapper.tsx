"use client";

import { AuthWrapper } from "./auth-wrapper";
import { Sidebar } from "./sidebar";
import { useLandStore } from "@/lib/store";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user } = useLandStore();

  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";

  // DEBUG: Let's see what's happening
  console.log("🔍 Layout Debug:", {
    currentPath,
    user: user ? "EXISTS" : "NULL",
  });

  // Show sidebar on dashboard and protected pages
  const protectedPaths = ["/dashboard", "/my-land", "/transfers"];
  const shouldShowSidebar = protectedPaths.some((path) =>
    currentPath.startsWith(path)
  );

  // Auth pages and landing page don't need sidebar
  const publicPaths = ["/", "/signin", "/signup"];
  const isPublicPage = publicPaths.includes(currentPath);

  if (isPublicPage) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </AuthWrapper>
    );
  }

  // SHOW REAL SIDEBAR on protected pages with proper spacing
  if (shouldShowSidebar) {
    console.log("🎯 SHOWING SIDEBAR FOR:", currentPath);
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <main className="lg:ml-80 min-h-screen p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </AuthWrapper>
    );
  }

  // Default layout
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </AuthWrapper>
  );
}

export default LayoutWrapper;
