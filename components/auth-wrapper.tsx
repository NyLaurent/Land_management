"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLandStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const {
    user,
    isLoading,
    profile,
    isAuthLoading,
    initializeAuth,
    fetchProfile,
    fetchLands,
    fetchTransfers,
  } = useLandStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user && !profile) {
      fetchProfile();
      fetchLands();
      fetchTransfers();
    }
  }, [user, profile, fetchProfile, fetchLands, fetchTransfers]);

  // Show loading for auth check
  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Loading your dashboard...
            </h2>
            <p className="text-gray-600">Please wait while we set things up</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check if user needs authentication
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const publicPaths = ["/", "/signin", "/signup"];
  const isPublicPath = publicPaths.includes(currentPath);

  if (!user && !isPublicPath) {
    router.push("/signin");
    return null;
  }

  return <>{children}</>;
}
