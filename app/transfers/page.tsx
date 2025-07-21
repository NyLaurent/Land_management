"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { transferOperations, fileUpload } from "@/lib/supabase";
import { transferSchema, type TransferFormData } from "@/lib/validations";
import { useLandStore } from "@/lib/store";
import { formatDate, getStatusColor, formatFileSize } from "@/lib/utils";
import type { Transfer } from "@/types";

export default function TransfersPage() {
  const {
    transfers,
    lands,
    addTransfer,
    updateTransfer,
    removeTransfer,
    isTransferLoading,
    isModalOpen,
    modalType,
    setModalState,
  } = useLandStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  // Create transfer mutation
  const createTransferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      let documentUrl = "";

      // Upload file if provided
      if (data.contract_document) {
        const uploadResult = await fileUpload.uploadDocument(
          data.contract_document,
          "transfer-contracts"
        );
        if (uploadResult.error) {
          throw new Error("Failed to upload document");
        }
        documentUrl = uploadResult.data!.url;
      }

      // Create transfer record
      return transferOperations.create({
        recipient_name: data.recipient_name,
        parcel_id: data.parcel_id,
        contract_document: documentUrl,
      });
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error("Failed to create transfer: " + result.error.message);
      } else if (result.data) {
        toast.success("Transfer created successfully!");
        addTransfer(result.data);
        reset();
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setModalState(false);
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to create transfer: " + error.message);
    },
  });

  // Update transfer mutation
  const updateTransferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      if (!editingTransfer) throw new Error("No transfer selected for editing");

      let documentUrl = editingTransfer.contract_document;

      // Upload new file if provided
      if (data.contract_document) {
        const uploadResult = await fileUpload.uploadDocument(
          data.contract_document,
          "transfer-contracts"
        );
        if (uploadResult.error) {
          throw new Error("Failed to upload document");
        }
        documentUrl = uploadResult.data!.url;
      }

      return transferOperations.update(editingTransfer.id, {
        recipient_name: data.recipient_name,
        parcel_id: data.parcel_id,
        contract_document: documentUrl,
      });
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error("Failed to update transfer: " + result.error.message);
      } else if (result.data) {
        toast.success("Transfer updated successfully!");
        updateTransfer(result.data.id, result.data);
        reset();
        setSelectedFile(null);
        setEditingTransfer(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setModalState(false);
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update transfer: " + error.message);
    },
  });

  // Delete transfer mutation
  const deleteTransferMutation = useMutation({
    mutationFn: async (transferId: number) => {
      return transferOperations.delete(transferId);
    },
    onSuccess: (result, transferId) => {
      if (result.error) {
        toast.error("Failed to delete transfer: " + result.error.message);
      } else {
        toast.success("Transfer deleted successfully!");
        removeTransfer(transferId);
        setModalState(false);
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to delete transfer: " + error.message);
    },
  });

  const onSubmit = (data: TransferFormData) => {
    if (modalType === "edit" && editingTransfer) {
      updateTransferMutation.mutate(data);
    } else {
      createTransferMutation.mutate(data);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("contract_document", file);
    }
  };

  const openCreateModal = () => {
    reset();
    setSelectedFile(null);
    setEditingTransfer(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setModalState(true, "create");
  };

  const openEditModal = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setValue("recipient_name", transfer.recipient_name);
    setValue("parcel_id", transfer.parcel_id);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setModalState(true, "edit");
  };

  const openDeleteModal = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setModalState(true, "delete");
  };

  const confirmDelete = () => {
    if (editingTransfer) {
      deleteTransferMutation.mutate(editingTransfer.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get available parcels (any registered land with parcel_id can be transferred)
  const availableParcels = lands.filter(
    (land) => Boolean(land.parcel_id) // Any land with a parcel ID can be transferred
  );

  const selectedParcelId = watch("parcel_id");
  const selectedParcel = availableParcels.find(
    (land) => land.parcel_id.toString() === selectedParcelId
  );

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Land Transfers</h1>
            <p className="text-gray-600">Manage land ownership transfers</p>
          </div>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={availableParcels.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {availableParcels.length === 0 && (
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  No available parcels for transfer
                </p>
                <p className="text-sm text-yellow-700">
                  You need registered land parcels before creating transfers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clean Transfer Table */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Transfer History
          </CardTitle>
          <CardDescription className="text-gray-600">
            View and manage all your transfer requests
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isTransferLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading transfers...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No transfers yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first land transfer request
              </p>
              <Button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={availableParcels.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Transfer
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcel ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contract
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transfer.status)}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(transfer.status)}`}
                          >
                            {transfer.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {transfer.recipient_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {transfer.parcel_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {transfer.created_at
                              ? formatDate(transfer.created_at)
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transfer.contract_document ? (
                          <a
                            href={transfer.contract_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No document
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(transfer)}
                            disabled={transfer.status === "completed"}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(transfer)}
                            disabled={transfer.status === "completed"}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple Create/Edit Modal */}
      <Dialog
        open={isModalOpen && (modalType === "create" || modalType === "edit")}
        onOpenChange={(open) => setModalState(open, modalType)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {modalType === "edit" ? "Edit Transfer" : "Create Transfer"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {modalType === "edit"
                ? "Update the transfer details below."
                : "Fill in the details to create a new land transfer."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient_name" className="text-sm font-medium">
                Recipient Name
              </Label>
              <Input
                id="recipient_name"
                placeholder="Enter recipient's full name"
                {...register("recipient_name")}
                className="w-full"
              />
              {errors.recipient_name && (
                <p className="text-sm text-red-600">
                  {errors.recipient_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parcel_id" className="text-sm font-medium">
                Select Parcel to Transfer
              </Label>
              <div className="relative">
                <select
                  id="parcel_id"
                  {...register("parcel_id")}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="">Choose a parcel to transfer</option>
                  {availableParcels.map((land) => (
                    <option key={land.id} value={land.parcel_id}>
                      {land.parcel_id} - {land.size.toLocaleString()} m² (
                      {land.ownership_type})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.parcel_id && (
                <p className="text-sm text-red-600">
                  {errors.parcel_id.message}
                </p>
              )}
              {selectedParcel && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Selected Parcel:</span>{" "}
                    {selectedParcel.parcel_id}
                  </p>
                  <p className="text-sm text-blue-600">
                    Size: {selectedParcel.size.toLocaleString()} m² • Type:{" "}
                    {selectedParcel.ownership_type}
                  </p>
                </div>
              )}
              {availableParcels.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  No parcels available. Please register a land parcel first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contract_document"
                className="text-sm font-medium"
              >
                Contract Document (Optional)
              </Label>
              <Input
                ref={fileInputRef}
                id="contract_document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name} (
                  {formatFileSize(selectedFile.size)})
                </p>
              )}
              {errors.contract_document?.message && (
                <p className="text-sm text-red-600">
                  {String(errors.contract_document.message)}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Supported: PDF, JPEG, PNG (max 10MB)
              </p>
            </div>

            <DialogFooter className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalState(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  createTransferMutation.isPending ||
                  updateTransferMutation.isPending ||
                  availableParcels.length === 0
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ||
                createTransferMutation.isPending ||
                updateTransferMutation.isPending
                  ? "Saving..."
                  : modalType === "edit"
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Simple Delete Modal */}
      <Dialog
        open={isModalOpen && modalType === "delete"}
        onOpenChange={(open) => setModalState(open, modalType)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Delete Transfer
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this transfer to{" "}
              <strong>{editingTransfer?.recipient_name}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setModalState(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteTransferMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteTransferMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
