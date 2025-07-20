"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MapPin, FileText, Home } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      description: "Dashboard overview",
    },
    {
      href: "/my-land",
      label: "My Land",
      icon: MapPin,
      description: "Register and manage land",
    },
    {
      href: "/transfers",
      label: "Transfers",
      icon: FileText,
      description: "Land transfer requests",
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Rwanda Land</h1>
                <p className="text-xs text-gray-500">Administration System</p>
              </div>
            </div>
          </div>

          {/* Navigation items */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User info placeholder */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <span className="text-sm text-gray-700">User</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
