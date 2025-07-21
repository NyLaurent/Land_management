"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FileText, Plus, Edit, Trash2, Upload, Eye } from "lucide-react";

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
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  // Fetch all transfers
  // Note: Data is now loaded in AuthWrapper, so we use the store data

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
        return <div className="h-2 w-2 bg-yellow-500 rounded-full" />;
      case "in_progress":
        return (
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
        );
      case "completed":
        return <div className="h-2 w-2 bg-green-500 rounded-full" />;
      case "cancelled":
        return <div className="h-2 w-2 bg-red-500 rounded-full" />;
      default:
        return <div className="h-2 w-2 bg-gray-500 rounded-full" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Land Transfers</h1>
            <p className="text-gray-600">Manage land ownership transfers</p>
          </div>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Transfer
        </Button>
      </div>

      {/* Transfer List */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>
            View and manage all your land transfer requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTransferLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading transfers...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transfers yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first land transfer request
              </p>
              <Button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Transfer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(transfer.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          To: {transfer.recipient_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Parcel ID: {transfer.parcel_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}
                      >
                        {transfer.status.replace("_", " ").toUpperCase()}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(transfer)}
                          disabled={transfer.status === "completed"}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(transfer)}
                          disabled={transfer.status === "completed"}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-1 capitalize">
                        {transfer.status.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-1">
                        {transfer.created_at
                          ? formatDate(transfer.created_at)
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      {transfer.contract_document && (
                        <a
                          href={transfer.contract_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Contract
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Transfer Dialog */}
      <Dialog
        open={isModalOpen && (modalType === "create" || modalType === "edit")}
        onOpenChange={(open) => setModalState(open, modalType)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalType === "edit" ? "Edit Transfer" : "Create Transfer"}
            </DialogTitle>
            <DialogDescription>
              {modalType === "edit"
                ? "Update the transfer details below."
                : "Fill in the details to create a new land transfer."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="recipient_name"
                className="text-sm font-medium text-gray-700"
              >
                Recipient Name
              </Label>
              <Input
                id="recipient_name"
                placeholder="Enter recipient's full name"
                {...register("recipient_name")}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              {errors.recipient_name && (
                <p className="text-sm text-red-500">
                  {errors.recipient_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="parcel_id"
                className="text-sm font-medium text-gray-700"
              >
                Parcel ID
              </Label>
              <Input
                id="parcel_id"
                placeholder="Enter parcel ID to transfer"
                {...register("parcel_id")}
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
                htmlFor="contract_document"
                className="text-sm font-medium text-gray-700"
              >
                Contract Document (Optional)
              </Label>
              <div className="relative">
                <Input
                  ref={fileInputRef}
                  id="contract_document"
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
              {errors.contract_document?.message && (
                <p className="text-sm text-red-500">
                  {String(errors.contract_document.message)}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Supported formats: PDF, JPEG, PNG (max 10MB)
              </p>
            </div>

            <DialogFooter className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalState(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  createTransferMutation.isPending ||
                  updateTransferMutation.isPending
                }
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ||
                createTransferMutation.isPending ||
                updateTransferMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {modalType === "edit" ? "Updating..." : "Creating..."}
                  </div>
                ) : modalType === "edit" ? (
                  "Update Transfer"
                ) : (
                  "Create Transfer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isModalOpen && modalType === "delete"}
        onOpenChange={(open) => setModalState(open, modalType)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transfer to{" "}
              <strong>{editingTransfer?.recipient_name}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalState(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteTransferMutation.isPending}
            >
              {deleteTransferMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
