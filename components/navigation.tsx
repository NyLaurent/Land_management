"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, Home, FileText, Users, LogOut, User } from "lucide-react";
import { useLandStore } from "@/lib/store";
import { authOperations } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "My Land", href: "/my-land", icon: MapPin },
  { name: "Transfers", href: "/transfers", icon: FileText },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, user, clearAuth } = useLandStore();

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
    } catch (error) {
      toast.error("An error occurred while signing out");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Rwanda Land
                </h1>
                <p className="text-xs text-gray-500">Administration</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || user?.email || "User"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <nav className="flex space-x-4 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
