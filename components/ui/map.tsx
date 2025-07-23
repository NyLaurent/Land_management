"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import { Style, Fill, Stroke } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";
import { Draw, Modify, Snap } from "ol/interaction";
import "ol/ol.css";

export interface LandParcel {
  id: string;
  parcel_id: number;
  coordinates: number[][];
  status: "pending" | "under_review" | "approved" | "rejected";
  size: number;
  ownership_type: string;
}

interface MapComponentProps {
  className?: string;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  parcels?: LandParcel[];
  onParcelDraw?: (coordinates: number[][]) => void;
  onParcelClick?: (parcel: LandParcel) => void;
  drawingEnabled?: boolean;
  height?: string;
}

const RWANDA_CENTER: [number, number] = [30.0619, -1.9403]; // Kigali coordinates

export function MapComponent({
  className = "",
  center = RWANDA_CENTER,
  zoom = 10,
  parcels = [],
  onParcelDraw,
  onParcelClick,
  drawingEnabled = false,
  height = "400px",
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const drawInteractionRef = useRef<Draw | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: "rgba(59, 130, 246, 0.2)", // Blue with transparency
        }),
        stroke: new Stroke({
          color: "#3B82F6",
          width: 2,
        }),
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
    });

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, [center, zoom]);

  // Handle drawing functionality
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;

    if (drawingEnabled && !drawInteractionRef.current) {
      const draw = new Draw({
        source: vectorSourceRef.current,
        type: "Polygon",
      });

      const modify = new Modify({ source: vectorSourceRef.current });
      const snap = new Snap({ source: vectorSourceRef.current });

      map.addInteraction(draw);
      map.addInteraction(modify);
      map.addInteraction(snap);

      draw.on("drawend", (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry() as Polygon;
        const coordinates = geometry
          .getCoordinates()[0]
          .map((coord) => toLonLat(coord));

        if (onParcelDraw) {
          onParcelDraw(coordinates);
        }
      });

      drawInteractionRef.current = draw;
    } else if (!drawingEnabled && drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
  }, [drawingEnabled, isMapReady, onParcelDraw]);

  // Update parcels on map
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    const source = vectorSourceRef.current;
    source.clear();

    parcels.forEach((parcel) => {
      if (parcel.coordinates && parcel.coordinates.length > 0) {
        const coordinates = parcel.coordinates.map((coord) =>
          fromLonLat(coord)
        );
        const polygon = new Polygon([coordinates]);

        const feature = new Feature({
          geometry: polygon,
          parcel: parcel,
        });

        // Style based on status
        const statusColors = {
          pending: { fill: "rgba(251, 191, 36, 0.2)", stroke: "#F59E0B" },
          under_review: { fill: "rgba(59, 130, 246, 0.2)", stroke: "#3B82F6" },
          approved: { fill: "rgba(16, 185, 129, 0.2)", stroke: "#10B981" },
          rejected: { fill: "rgba(239, 68, 68, 0.2)", stroke: "#EF4444" },
        };

        const colors = statusColors[parcel.status] || statusColors.pending;

        feature.setStyle(
          new Style({
            fill: new Fill({ color: colors.fill }),
            stroke: new Stroke({ color: colors.stroke, width: 2 }),
          })
        );

        source.addFeature(feature);
      }
    });
  }, [parcels, isMapReady]);

  // Handle click events
  useEffect(() => {
    if (!mapInstanceRef.current || !onParcelClick) return;

    const handleClick = (event: any) => {
      mapInstanceRef.current?.forEachFeatureAtPixel(
        event.pixel,
        (feature: any) => {
          const parcel = feature.get("parcel") as LandParcel;
          if (parcel) {
            onParcelClick(parcel);
          }
        }
      );
    };

    mapInstanceRef.current.on("click", handleClick);

    return () => {
      mapInstanceRef.current?.un("click", handleClick);
    };
  }, [onParcelClick, isMapReady]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full border rounded-lg overflow-hidden"
        style={{ height }}
      />
      {drawingEnabled && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Drawing Mode Active
          </div>
          <div className="text-xs text-gray-500">
            Click to draw land boundaries
          </div>
        </div>
      )}
      {parcels.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="text-sm font-medium text-gray-700 mb-2">Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-200 border border-yellow-500 rounded mr-2"></div>
              Pending
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-200 border border-blue-500 rounded mr-2"></div>
              Under Review
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-200 border border-green-500 rounded mr-2"></div>
              Approved
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-200 border border-red-500 rounded mr-2"></div>
              Rejected
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
