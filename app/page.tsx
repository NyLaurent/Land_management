"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, FileText, Plus, BarChart3 } from "lucide-react";
import { useLandStore } from "@/lib/store";

export default function HomePage() {
  const { lands, transfers } = useLandStore();

  const stats = [
    {
      title: "Total Land Registrations",
      value: lands.length,
      description: "Registered land parcels",
      icon: MapPin,
      href: "/my-land",
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Active Transfers",
      value: transfers.filter(
        (t) => t.status === "pending" || t.status === "in_progress"
      ).length,
      description: "Ongoing transfer requests",
      icon: FileText,
      href: "/transfers",
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Completed Transfers",
      value: transfers.filter((t) => t.status === "completed").length,
      description: "Successfully completed",
      icon: BarChart3,
      href: "/transfers",
      color: "text-purple-600 bg-purple-100",
    },
  ];

  const quickActions = [
    {
      title: "Register New Land",
      description: "Register a new land parcel with supporting documents",
      href: "/my-land",
      icon: Plus,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Create Transfer",
      description: "Initiate a land ownership transfer",
      href: "/transfers",
      icon: FileText,
      color: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Rwanda Land Administration
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Streamline land registration, transfers, and management with our
          digital platform. Secure, transparent, and efficient land
          administration for all Rwandans.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={action.href}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Information Section */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">About This System</CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <p className="mb-4">
            This digital land administration system helps streamline Rwanda's
            land management processes by:
          </p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Providing a centralized platform for land registration</li>
            <li>Enabling secure and transparent land ownership transfers</li>
            <li>Reducing processing time from weeks to days</li>
            <li>Maintaining comprehensive digital records</li>
            <li>Supporting dispute resolution with clear documentation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
