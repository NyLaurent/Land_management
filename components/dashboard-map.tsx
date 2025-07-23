"use client";

import { useMemo } from 'react';
import { MapComponent, LandParcel } from '@/components/ui/map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, BarChart3, TrendingUp, MapIcon } from 'lucide-react';
import { Land } from '@/types';

interface DashboardMapProps {
  lands: Land[];
  className?: string;
}

export function DashboardMap({ lands, className = '' }: DashboardMapProps) {
  // Convert lands to map format and calculate statistics
  const { mapParcels, stats } = useMemo(() => {
    const parcelsWithCoords = lands.filter(land => land.coordinates && land.coordinates.length > 0);
    
    const mapParcels: LandParcel[] = parcelsWithCoords.map(land => ({
      id: land.id.toString(),
      parcel_id: land.parcel_id,
      coordinates: land.coordinates!,
      status: land.statusa,
      size: land.size,
      ownership_type: land.ownership_type,
    }));

    // Calculate statistics
    const totalArea = lands.reduce((sum, land) => sum + land.size, 0);
    const approvedArea = lands
      .filter(land => land.statusa === 'approved')
      .reduce((sum, land) => sum + land.size, 0);
    
    const statusCounts = lands.reduce((acc, land) => {
      acc[land.statusa] = (acc[land.statusa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      mapParcels,
      stats: {
        totalParcels: lands.length,
        mappedParcels: parcelsWithCoords.length,
        totalArea,
        approvedArea,
        statusCounts,
      },
    };
  }, [lands]);

  // Calculate center point for map
  const mapCenter = useMemo(() => {
    if (mapParcels.length === 0) return undefined;
    
    const allCoords = mapParcels.flatMap(parcel => parcel.coordinates);
    const avgLng = allCoords.reduce((sum, coord) => sum + coord[0], 0) / allCoords.length;
    const avgLat = allCoords.reduce((sum, coord) => sum + coord[1], 0) / allCoords.length;
    
    return [avgLng, avgLat] as [number, number];
  }, [mapParcels]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Parcels</p>
                <p className="text-xl font-semibold text-gray-900">{stats.totalParcels}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mapped Parcels</p>
                <p className="text-xl font-semibold text-gray-900">{stats.mappedParcels}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Area</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(stats.totalArea / 10000).toFixed(1)} ha
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved Area</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(stats.approvedArea / 10000).toFixed(1)} ha
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Land Parcels Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mapParcels.length > 0 ? (
                <MapComponent
                  parcels={mapParcels}
                  center={mapCenter}
                  zoom={mapParcels.length === 1 ? 15 : 12}
                  height="500px"
                  className="w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <MapPin className="h-16 w-16 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Mapped Parcels</h3>
                  <p className="text-sm text-center max-w-md">
                    Start adding geographic boundaries to your land registrations to see them on the map.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.statusCounts).map(([status, count]) => {
                const statusColors = {
                  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
                  approved: 'bg-green-100 text-green-800 border-green-200',
                  rejected: 'bg-red-100 text-red-800 border-red-200',
                };

                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {count}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mapping Coverage</span>
                <span className="font-medium">
                  {stats.totalParcels > 0 
                    ? Math.round((stats.mappedParcels / stats.totalParcels) * 100)
                    : 0}%
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Approval Rate</span>
                <span className="font-medium">
                  {stats.totalParcels > 0 
                    ? Math.round(((stats.statusCounts.approved || 0) / stats.totalParcels) * 100)
                    : 0}%
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Parcel Size</span>
                <span className="font-medium">
                  {stats.totalParcels > 0 
                    ? (stats.totalArea / stats.totalParcels / 10000).toFixed(2) + ' ha'
                    : '0 ha'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 