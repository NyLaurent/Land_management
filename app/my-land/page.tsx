"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  MapPin,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { landOperations, fileUpload } from "@/lib/supabase";
import {
  landRegistrationSchema,
  type LandRegistrationFormData,
} from "@/lib/validations";
import { useLandStore } from "@/lib/store";
import { formatDate, getStatusColor, formatFileSize } from "@/lib/utils";
import type { Land } from "@/types";

export default function MyLandPage() {
  const queryClient = useQueryClient();
  const { lands, setLands, addLand, setLandLoading } = useLandStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LandRegistrationFormData>({
    resolver: zodResolver(landRegistrationSchema),
  });

  // Fetch all land registrations
  const { data: landData, isLoading } = useQuery({
    queryKey: ["lands"],
    queryFn: landOperations.getAll,
    onSuccess: (result) => {
      if (result.data) {
        setLands(result.data);
      }
    },
  });

  // Create land registration mutation
  const createLandMutation = useMutation({
    mutationFn: async (data: LandRegistrationFormData) => {
      let documentUrl = "";

      // Upload file if provided
      if (data.supporting_document) {
        const uploadResult = await fileUpload.uploadDocument(
          data.supporting_document,
          "land-documents"
        );
        if (uploadResult.error) {
          throw new Error("Failed to upload document");
        }
        documentUrl = uploadResult.data!.url;
      }

      // Create land record
      return landOperations.create({
        parcel_id: data.parcel_id,
        size: data.size,
        ownership_type: data.ownership_type,
        supporting_document: documentUrl,
        statusa: "pending",
      });
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error("Failed to register land: " + result.error.message);
      } else if (result.data) {
        toast.success("Land registration submitted successfully!");
        addLand(result.data);
        reset();
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    onError: (error: any) => {
      toast.error("Failed to register land: " + error.message);
    },
  });

  const onSubmit = (data: LandRegistrationFormData) => {
    createLandMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("supporting_document", file);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "under_review":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <MapPin className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Land</h1>
          <p className="text-gray-600">Register and manage your land parcels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Register New Land</CardTitle>
            <CardDescription>
              Submit your land registration with supporting documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parcel_id">Parcel ID</Label>
                <Input
                  id="parcel_id"
                  type="number"
                  placeholder="Enter parcel ID"
                  {...register("parcel_id", { valueAsNumber: true })}
                />
                {errors.parcel_id && (
                  <p className="text-sm text-red-500">
                    {errors.parcel_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Land Size (m²)</Label>
                <Input
                  id="size"
                  type="number"
                  placeholder="Enter land size in square meters"
                  {...register("size", { valueAsNumber: true })}
                />
                {errors.size && (
                  <p className="text-sm text-red-500">{errors.size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownership_type">Ownership Type</Label>
                <Input
                  id="ownership_type"
                  placeholder="e.g., Individual, Family, Corporation"
                  {...register("ownership_type")}
                />
                {errors.ownership_type && (
                  <p className="text-sm text-red-500">
                    {errors.ownership_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supporting_document">Supporting Document</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    ref={fileInputRef}
                    id="supporting_document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <Upload className="h-4 w-4 text-gray-400" />
                </div>
                {selectedFile && (
                  <p className="text-sm text-green-600">
                    Selected: {selectedFile.name} (
                    {formatFileSize(selectedFile.size)})
                  </p>
                )}
                {errors.supporting_document && (
                  <p className="text-sm text-red-500">
                    {errors.supporting_document.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, JPEG, PNG (max 10MB)
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || createLandMutation.isPending}
                className="w-full"
              >
                {isSubmitting || createLandMutation.isPending
                  ? "Registering..."
                  : "Register Land"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Application History */}
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>
              Track the status of your land registration applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Loading applications...
                </p>
              </div>
            ) : lands.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No land registrations yet</p>
                <p className="text-sm text-gray-400">
                  Start by registering your first land parcel
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lands.map((land) => (
                  <div
                    key={land.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                          Parcel #{land.parcel_id}
                        </span>
                        {getStatusIcon(land.statusa)}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(land.statusa)}`}
                      >
                        {land.statusa.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-1">
                          {land.size.toLocaleString()} m²
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-1">{land.ownership_type}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-1">
                          {land.created_at
                            ? formatDate(land.created_at)
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {land.supporting_document && (
                      <div className="mt-3">
                        <a
                          href={land.supporting_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          View Supporting Document
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
