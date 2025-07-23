"use client";

import { useState } from "react";
import { MapComponent, LandParcel } from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Edit3, Eye, Square, Info } from "lucide-react";
import { Land } from "@/types";
import toast from "react-hot-toast";

interface LandParcelMapProps {
  lands: Land[];
  onCoordinatesChange?: (coordinates: number[][]) => void;
  drawingMode?: boolean;
  showControls?: boolean;
  height?: string;
  className?: string;
}

export function LandParcelMap({
  lands,
  onCoordinatesChange,
  drawingMode = false,
  showControls = true,
  height = "500px",
  className = "",
}: LandParcelMapProps) {
  const [isDrawing, setIsDrawing] = useState(drawingMode);
  const [selectedParcel, setSelectedParcel] = useState<Land | null>(null);

  // Convert Land objects to LandParcel format for the map
  const mapParcels: LandParcel[] = lands
    .filter((land) => land.coordinates && land.coordinates.length > 0)
    .map((land) => ({
      id: land.id.toString(),
      parcel_id: land.parcel_id,
      coordinates: land.coordinates!,
      status: land.statusa,
      size: land.size,
      ownership_type: land.ownership_type,
    }));

  const handleParcelDraw = (coordinates: number[][]) => {
    if (coordinates.length < 3) {
      toast.error("Please draw a valid polygon with at least 3 points");
      return;
    }

    // Calculate approximate area (simplified)
    const calculateArea = (coords: number[][]) => {
      // This is a simplified area calculation
      let area = 0;
      const n = coords.length;

      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coords[i][0] * coords[j][1];
        area -= coords[j][0] * coords[i][1];
      }

      return (Math.abs(area) * 6378137 * 6378137) / 2; // Rough conversion to m²
    };

    const estimatedArea = Math.round(calculateArea(coordinates));

    toast.success(
      `Land boundary drawn! Estimated area: ${estimatedArea.toLocaleString()} m²`
    );

    if (onCoordinatesChange) {
      onCoordinatesChange(coordinates);
    }

    setIsDrawing(false);
  };

  const handleParcelClick = (parcel: LandParcel) => {
    const land = lands.find((l) => l.id.toString() === parcel.id);
    if (land) {
      setSelectedParcel(land);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "under_review":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showControls && (
        <div className="flex items-center justify-between bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Land Parcel Map</h3>
              <p className="text-sm text-gray-600">
                {mapParcels.length} parcel{mapParcels.length !== 1 ? "s" : ""}{" "}
                displayed
              </p>
            </div>
          </div>

          {onCoordinatesChange && (
            <div className="flex items-center space-x-2">
              <Button
                variant={isDrawing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsDrawing(!isDrawing)}
                className="flex items-center space-x-2"
              >
                {isDrawing ? (
                  <>
                    <Square className="h-4 w-4" />
                    Stop Drawing
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Draw Boundary
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <MapComponent
            parcels={mapParcels}
            onParcelDraw={handleParcelDraw}
            onParcelClick={handleParcelClick}
            drawingEnabled={isDrawing}
            height={height}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          {selectedParcel ? (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Parcel Details
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedParcel(null)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Parcel ID:</span>
                  <p className="text-gray-900">#{selectedParcel.parcel_id}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Size:</span>
                  <p className="text-gray-900">
                    {selectedParcel.size.toLocaleString()} m²
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Ownership:</span>
                  <p className="text-gray-900">
                    {selectedParcel.ownership_type}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(selectedParcel.statusa)}`}
                  >
                    {selectedParcel.statusa.replace("_", " ").toUpperCase()}
                  </div>
                </div>

                {selectedParcel.supporting_document && (
                  <div className="pt-2 border-t">
                    <a
                      href={selectedParcel.supporting_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Document</span>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Info className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  Click on a parcel on the map to view details
                </p>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Status Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-200 border border-yellow-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-200 border border-blue-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Under Review</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-200 border border-green-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Approved</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-200 border border-red-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Rejected</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
