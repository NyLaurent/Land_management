"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import AuthWrapper from "@/components/auth-wrapper";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

function PublicLandingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Landing page gets full screen treatment without navigation
  if (pathname === "/") {
    return <div className="min-h-screen">{children}</div>;
  }

  // Other protected pages get normal container layout
  return (
    <div className="min-h-screen bg-blue-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Auth pages don't need navigation
  if (pathname === "/signin" || pathname === "/signup") {
    return <div className="min-h-screen">{children}</div>;
  }

  // Landing page is public - no auth protection needed
  if (pathname === "/") {
    return <PublicLandingLayout>{children}</PublicLandingLayout>;
  }

  // All other pages need authentication
  return (
    <AuthWrapper>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthWrapper>
  );
}
