"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MapPin,
  FileText,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLandStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview & stats",
  },
  {
    name: "My Land",
    href: "/my-land",
    icon: MapPin,
    description: "Land registrations",
  },
  {
    name: "Transfers",
    href: "/transfers",
    icon: FileText,
    description: "Ownership transfers",
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, clearStore } = useLandStore();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      clearStore();
      toast.success("Logged out successfully!");
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 40,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 40,
      },
    },
  };

  return (
    <>
      {/* Mobile Menu Button - Only show on small screens */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-lg shadow-md"
        size="sm"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </Button>

      {/* Mobile Overlay - Only on small screens */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - FIXED non-scrollable desktop sidebar */}
      <div className="fixed left-0 top-0 w-80 min-w-80 max-w-80 h-screen bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex lg:flex-col overflow-hidden z-30">
        <div className="flex flex-col h-full p-6 overflow-hidden">
          {/* Logo/Brand */}
          <div className="mb-8 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 whitespace-nowrap">
              Land Management
            </h1>
            <p className="text-sm text-gray-600 whitespace-nowrap">
              Digital Administration
            </p>
          </div>

          {/* User Profile Section */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full inline-block">
              Property Owner
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-hidden">
            <div className="h-full overflow-hidden">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 whitespace-nowrap flex-shrink-0">
                Navigation
              </p>
              <div className="space-y-1 mb-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 min-w-0 ${
                        isActive
                          ? "bg-blue-500 text-white shadow-md"
                          : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p
                            className={`text-xs truncate ${isActive ? "text-blue-100" : "text-gray-500"}`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ${isActive ? "text-white" : ""}`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Logout Button - Under Navigation */}
              <Button
                onClick={handleLogout}
                className="w-full justify-start space-x-3 p-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-xl transition-all duration-200 flex-shrink-0"
                variant="ghost"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">Sign Out</span>
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar - Only for small screens with fixed width */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        className="fixed left-0 top-0 h-full w-80 min-w-80 max-w-80 bg-white border-r border-gray-200 z-50 lg:hidden shadow-lg overflow-hidden"
      >
        {/* Close Button (Mobile) */}
        <Button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 transition-all duration-200 rounded-lg z-10"
          size="sm"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col h-full p-6 overflow-hidden">
          {/* Logo/Brand */}
          <div className="mb-8 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 whitespace-nowrap">
              Land Management
            </h1>
            <p className="text-sm text-gray-600 whitespace-nowrap">
              Digital Administration
            </p>
          </div>

          {/* User Profile Section */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full inline-block">
              Property Owner
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-hidden">
            <div className="h-full overflow-hidden">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 whitespace-nowrap flex-shrink-0">
                Navigation
              </p>
              <div className="space-y-1 mb-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 min-w-0 ${
                        isActive
                          ? "bg-blue-500 text-white shadow-md"
                          : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p
                            className={`text-xs truncate ${isActive ? "text-blue-100" : "text-gray-500"}`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ${isActive ? "text-white" : ""}`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Logout Button - Under Navigation */}
              <Button
                onClick={handleLogout}
                className="w-full justify-start space-x-3 p-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-xl transition-all duration-200 flex-shrink-0"
                variant="ghost"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">Sign Out</span>
              </Button>
            </div>
          </nav>
        </div>
      </motion.div>
    </>
  );
}
