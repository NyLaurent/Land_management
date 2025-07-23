"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  FileText,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Map,
} from "lucide-react";
import { useLandStore } from "@/lib/store";
import { DashboardMap } from "@/components/dashboard-map";

export default function DashboardPage() {
  const {
    lands,
    transfers,
    profile,
    refreshAllData,
    isLandLoading,
    isTransferLoading,
  } = useLandStore();
  const isRefreshing = isLandLoading || isTransferLoading;
  const [showMapView, setShowMapView] = useState(false);

  const handleRefresh = () => {
    refreshAllData();
  };

  const stats = [
    {
      title: "Total Land Registrations",
      value: lands.length,
      description: "Registered land parcels",
      icon: MapPin,
      href: "/my-land",
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Active Transfers",
      value: transfers.filter(
        (t) => t.status === "pending" || t.status === "in_progress"
      ).length,
      description: "Ongoing transfer requests",
      icon: FileText,
      href: "/transfers",
      color: "text-orange-600 bg-orange-50",
    },
  ];

  const quickActions = [
    {
      title: "Register New Land",
      description: "Register a new land parcel with supporting documents",
      href: "/my-land",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Create Transfer",
      description: "Initiate a land ownership transfer",
      href: "/transfers",
      icon: FileText,
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "under_review":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || "User"}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here&apos;s what&apos;s happening with your land administration
            today
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={showMapView ? "default" : "outline"}
            onClick={() => setShowMapView(!showMapView)}
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white transition-all duration-200"
          >
            <Map className="h-4 w-4" />
            {showMapView ? "Hide Map" : "Show Map"}
          </Button>
          
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white transition-all duration-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Map View */}
      {showMapView && (
        <DashboardMap lands={lands} />
      )}

      {/* Statistics Cards - Only 2 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0  bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="transition-shadow border-0  bg-white rounded-xl"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-xl ${action.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href={action.href}>
                    <Button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Land Registrations */}
          <Card className="border-0 shadow-lg bg-white rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Recent Land Registrations</span>
              </CardTitle>
              <CardDescription>
                Your latest land registration applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lands.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No land registrations yet</p>
                  <Link href="/my-land">
                    <Button className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
                      Register Your First Land
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {lands.slice(0, 3).map((land) => (
                    <div
                      key={land.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Parcel #{land.parcel_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {land.size.toLocaleString()} m² -{" "}
                          {land.ownership_type}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(land.statusa)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(land.statusa)}`}
                        >
                          {land.statusa.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {lands.length > 3 && (
                    <Link href="/my-land">
                      <Button
                        variant="outline"
                        className="w-full mt-4 py-2 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors duration-200"
                      >
                        View All Registrations
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          <Card className="border-0 shadow-lg bg-white rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Recent Transfers</span>
              </CardTitle>
              <CardDescription>Your latest transfer requests</CardDescription>
            </CardHeader>
            <CardContent>
              {transfers.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transfers yet</p>
                  <Link href="/transfers">
                    <Button className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200">
                      Create First Transfer
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {transfers.slice(0, 3).map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          To: {transfer.recipient_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Parcel: {transfer.parcel_id}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transfer.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}
                        >
                          {transfer.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {transfers.length > 3 && (
                    <Link href="/transfers">
                      <Button
                        variant="outline"
                        className="w-full mt-4 py-2 border-2 border-green-300 text-green-600 hover:bg-green-50 font-medium rounded-lg transition-colors duration-200"
                      >
                        View All Transfers
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Section */}
    </div>
  );
}
