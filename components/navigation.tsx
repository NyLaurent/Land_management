"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MapPin,
  Home,
  FileText,
  LogOut,
  User,
  UserPlus,
  LogIn,
} from "lucide-react";
import { useLandStore } from "@/lib/store";
import { authOperations } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Land", href: "/my-land", icon: MapPin },
  { name: "Transfers", href: "/transfers", icon: FileText },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, user, isAuthenticated, clearAuth } = useLandStore();

  // Don't show navigation on auth pages
  if (pathname === "/signin" || pathname === "/signup") {
    return null;
  }

  const handleLogout = async () => {
    try {
      const { error } = await authOperations.signOut();

      if (error) {
        toast.error("Failed to sign out");
        return;
      }

      clearAuth();
      toast.success("Signed out successfully");
      router.push("/signin");
    } catch {
      toast.error("An error occurred while signing out");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center space-x-3"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Land Management
                </h1>
                <p className="text-xs text-blue-600 font-medium">
                  Administration
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Only show for authenticated users */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Menu or Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Authenticated User Menu
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {profile?.full_name || user?.email || "User"}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-white hover:bg-blue-600 border-blue-200 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              // Public Auth Buttons
              <div className="flex items-center space-x-3">
                <Link href="/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only for authenticated users */}
        {isAuthenticated && (
          <div className="md:hidden pb-4">
            <nav className="flex space-x-4 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
