"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
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

export default function MyLandPage() {
  const { lands, addLand, isLandLoading } = useLandStore();
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
    onError: (error: Error) => {
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
        <MapPin className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Land</h1>
          <p className="text-gray-600">Register and manage your land parcels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-gray-900">
              Register New Land
            </CardTitle>
            <CardDescription className="text-gray-600">
              Submit your land registration with supporting documents
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="parcel_id"
                  className="text-sm font-medium text-gray-700"
                >
                  Parcel ID
                </Label>
                <Input
                  id="parcel_id"
                  type="number"
                  placeholder="Enter parcel ID"
                  {...register("parcel_id", { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {errors.parcel_id && (
                  <p className="text-sm text-red-500">
                    {errors.parcel_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="size"
                  className="text-sm font-medium text-gray-700"
                >
                  Land Size (m²)
                </Label>
                <Input
                  id="size"
                  type="number"
                  placeholder="Enter land size in square meters"
                  {...register("size", { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {errors.size && (
                  <p className="text-sm text-red-500">{errors.size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="ownership_type"
                  className="text-sm font-medium text-gray-700"
                >
                  Ownership Type
                </Label>
                <Input
                  id="ownership_type"
                  placeholder="e.g., Individual, Family, Corporation"
                  {...register("ownership_type")}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {errors.ownership_type && (
                  <p className="text-sm text-red-500">
                    {errors.ownership_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="supporting_document"
                  className="text-sm font-medium text-gray-700"
                >
                  Supporting Document
                </Label>
                <div className="relative">
                  <Input
                    ref={fileInputRef}
                    id="supporting_document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                  <Upload className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {selectedFile && (
                  <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    Selected: {selectedFile.name} (
                    {formatFileSize(selectedFile.size)})
                  </p>
                )}
                {errors.supporting_document?.message && (
                  <p className="text-sm text-red-500">
                    {String(errors.supporting_document.message)}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, JPEG, PNG (max 10MB)
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || createLandMutation.isPending}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || createLandMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Registering Land...
                    </div>
                  ) : (
                    "Register Land"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Application History */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-gray-900">
              My Applications
            </CardTitle>
            <CardDescription className="text-gray-600">
              Track the status of your land registration applications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLandLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-3">
                  Loading applications...
                </p>
              </div>
            ) : lands.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                  <MapPin className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No land registrations yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start by registering your first land parcel
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lands.map((land) => (
                  <div
                    key={land.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-900">
                          Parcel #{land.parcel_id}
                        </span>
                        {getStatusIcon(land.statusa)}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(land.statusa)}`}
                      >
                        {land.statusa.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500 font-medium">Size:</span>
                        <span className="ml-2 text-gray-900">
                          {land.size.toLocaleString()} m²
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Type:</span>
                        <span className="ml-2 text-gray-900">
                          {land.ownership_type}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500 font-medium">
                        Submitted:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {land.created_at ? formatDate(land.created_at) : "N/A"}
                      </span>
                    </div>

                    {land.supporting_document && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <a
                          href={land.supporting_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
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
