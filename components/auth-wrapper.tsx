"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLandStore } from "@/lib/store";
import {
  authOperations,
  landOperations,
  transferOperations,
} from "@/lib/supabase";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isAuthLoading,
    setUser,
    setProfile,
    setAuthLoading,
    setLands,
    setTransfers,
    clearAuth,
  } = useLandStore();

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/signin", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);

        const { user, error } = await authOperations.getCurrentUser();

        if (error || !user) {
          clearAuth();
          // Only redirect to signin if trying to access protected route
          if (!isPublicRoute) {
            router.push("/signin");
          }
          return;
        }

        // Set user
        setUser({
          id: user.id,
          email: user.email!,
          created_at: user.created_at,
        });

        // Get user profile
        const { data: profileData, error: profileError } =
          await authOperations.getUserProfile(user.id);

        if (profileData && !profileError) {
          setProfile(profileData);
        }

        // Load user's lands and transfers
        await loadUserData();
      } catch {
        clearAuth();
        // Only redirect to signin if trying to access protected route
        if (!isPublicRoute) {
          router.push("/signin");
        }
      } finally {
        setAuthLoading(false);
      }
    };

    const loadUserData = async () => {
      try {
        // Load lands
        const { data: landsData, error: landsError } =
          await landOperations.getAll();
        if (landsData && !landsError) {
          setLands(landsData);
        } else if (landsError) {
          console.error("Error loading lands:", landsError);
        }

        // Load transfers
        const { data: transfersData, error: transfersError } =
          await transferOperations.getAll();
        if (transfersData && !transfersError) {
          setTransfers(transfersData);
        } else if (transfersError) {
          console.error("Error loading transfers:", transfersError);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    checkAuth();
  }, [
    router,
    pathname,
    setUser,
    setProfile,
    setAuthLoading,
    setLands,
    setTransfers,
    clearAuth,
    isPublicRoute,
  ]);

  // Show loading spinner while checking authentication (only for protected routes)
  if (isAuthLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  // For public routes, always show content
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
