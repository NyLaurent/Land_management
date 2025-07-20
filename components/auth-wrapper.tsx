"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLandStore } from "@/lib/store";
import { authOperations } from "@/lib/supabase";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const {
    isAuthenticated,
    isAuthLoading,
    setUser,
    setProfile,
    setAuthLoading,
    clearAuth,
  } = useLandStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);

        const { user, error } = await authOperations.getCurrentUser();

        if (error || !user) {
          clearAuth();
          router.push("/signin");
          return;
        }

        // Set user
        setUser({
          id: user.id,
          email: user.email!,
          created_at: user.created_at,
        });

        // Get profile
        const { data: profileData, error: profileError } =
          await authOperations.getUserProfile(user.id);

        if (profileData && !profileError) {
          setProfile(profileData);
        }
      } catch (error) {
        clearAuth();
        router.push("/signin");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router, setUser, setProfile, setAuthLoading, clearAuth]);

  // Show loading spinner while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
