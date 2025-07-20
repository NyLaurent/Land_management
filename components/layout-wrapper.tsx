"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import AuthWrapper from "@/components/auth-wrapper";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Auth pages don't need protection or navigation
  if (pathname === "/signin" || pathname === "/signup") {
    return <div className="min-h-screen">{children}</div>;
  }

  // Protected pages need AuthWrapper and Navigation
  return (
    <AuthWrapper>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthWrapper>
  );
}
