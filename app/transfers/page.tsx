"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { transferOperations, fileUpload } from "@/lib/supabase";
import { transferSchema, type TransferFormData } from "@/lib/validations";
import { useLandStore } from "@/lib/store";
import { formatDate, getStatusColor, formatFileSize } from "@/lib/utils";
import type { Transfer } from "@/types";

export default function TransfersPage() {
  const queryClient = useQueryClient();
  const {
    transfers,
    setTransfers,
    addTransfer,
    updateTransfer,
    removeTransfer,
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  // Fetch all transfers
  const { data: transferData, isLoading } = useQuery({
    queryKey: ["transfers"],
    queryFn: transferOperations.getAll,
    onSuccess: (result) => {
      if (result.data) {
        setTransfers(result.data);
      }
    },
  });

  // Create transfer mutation
  const createTransferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      let documentUrl = "";

      if (data.contract_document) {
        const uploadResult = await fileUpload.uploadDocument(
          data.contract_document,
          "transfer-contracts"
        );
        if (uploadResult.error) {
          throw new Error("Failed to upload contract document");
        }
        documentUrl = uploadResult.data!.url;
      }

      return transferOperations.create({
        recipient_name: data.recipient_name,
        parcel_id: data.parcel_id,
        contract_document: documentUrl,
        status: "pending",
      });
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error("Failed to create transfer: " + result.error.message);
      } else if (result.data) {
        toast.success("Transfer created successfully!");
        addTransfer(result.data);
        resetForm();
        setModalState(false);
      }
    },
    onError: (error: any) => {
      toast.error("Failed to create transfer: " + error.message);
    },
  });

  // Update transfer mutation
  const updateTransferMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Transfer> }) => {
      return transferOperations.update(data.id, data.updates);
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error("Failed to update transfer: " + result.error.message);
      } else if (result.data) {
        toast.success("Transfer updated successfully!");
        updateTransfer(result.data.id, result.data);
        resetForm();
        setModalState(false);
      }
    },
    onError: (error: any) => {
      toast.error("Failed to update transfer: " + error.message);
    },
  });

  // Delete transfer mutation
  const deleteTransferMutation = useMutation({
    mutationFn: transferOperations.delete,
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error("Failed to delete transfer: " + result.error.message);
      } else {
        toast.success("Transfer deleted successfully!");
        removeTransfer(variables);
        setModalState(false);
      }
    },
    onError: (error: any) => {
      toast.error("Failed to delete transfer: " + error.message);
    },
  });

  const resetForm = () => {
    reset();
    setSelectedFile(null);
    setEditingTransfer(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: TransferFormData) => {
    if (editingTransfer) {
      // Update existing transfer
      const updates: Partial<Transfer> = {
        recipient_name: data.recipient_name,
        parcel_id: data.parcel_id,
      };

      if (data.contract_document) {
        // Handle file update if needed
        toast.info("File upload for updates not implemented in this demo");
      }

      updateTransferMutation.mutate({
        id: editingTransfer.id,
        updates,
      });
    } else {
      // Create new transfer
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
    resetForm();
    setModalState(true, "create");
  };

  const openEditModal = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setValue("recipient_name", transfer.recipient_name);
    setValue("parcel_id", transfer.parcel_id);
    setModalState(true, "edit");
  };

  const openDeleteModal = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setModalState(true, "delete");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Land Transfers</h1>
            <p className="text-gray-600">
              Manage land ownership transfer requests
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {/* Transfers List */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Requests</CardTitle>
          <CardDescription>
            View and manage all land transfer requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading transfers...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-2">No transfers yet</p>
              <p className="text-gray-400 mb-4">
                Start by creating your first land transfer request
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Transfer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Transfer #{transfer.id}
                        </h3>
                        <p className="text-gray-600">
                          To: {transfer.recipient_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}
                      >
                        {transfer.status.replace("_", " ").toUpperCase()}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(transfer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(transfer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Parcel ID:</span>
                      <span className="ml-1 font-medium">
                        {transfer.parcel_id}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-1">{transfer.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-1">
                        {transfer.created_at
                          ? formatDate(transfer.created_at)
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {transfer.contract_document && (
                    <div className="mt-4">
                      <a
                        href={transfer.contract_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Contract Document
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Transfer Modal */}
      <Dialog
        open={isModalOpen && (modalType === "create" || modalType === "edit")}
        onOpenChange={(open) => setModalState(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalType === "edit" ? "Edit Transfer" : "Create New Transfer"}
            </DialogTitle>
            <DialogDescription>
              {modalType === "edit"
                ? "Update transfer information"
                : "Fill in the details to create a new land transfer request"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient_name">Recipient Name</Label>
              <Input
                id="recipient_name"
                placeholder="Enter recipient's full name"
                {...register("recipient_name")}
              />
              {errors.recipient_name && (
                <p className="text-sm text-red-500">
                  {errors.recipient_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parcel_id">Parcel ID</Label>
              <Input
                id="parcel_id"
                placeholder="Enter parcel ID to transfer"
                {...register("parcel_id")}
              />
              {errors.parcel_id && (
                <p className="text-sm text-red-500">
                  {errors.parcel_id.message}
                </p>
              )}
            </div>

            {modalType === "create" && (
              <div className="space-y-2">
                <Label htmlFor="contract_document">Contract Document</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    ref={fileInputRef}
                    id="contract_document"
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
                {errors.contract_document && (
                  <p className="text-sm text-red-500">
                    {errors.contract_document.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Optional: PDF, JPEG, PNG (max 10MB)
                </p>
              </div>
            )}

            <DialogFooter>
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
                  updateTransferMutation.isPending
                }
              >
                {isSubmitting ||
                createTransferMutation.isPending ||
                updateTransferMutation.isPending
                  ? "Processing..."
                  : modalType === "edit"
                    ? "Update Transfer"
                    : "Create Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isModalOpen && modalType === "delete"}
        onOpenChange={(open) => setModalState(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transfer request? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {editingTransfer && (
            <div className="py-4">
              <p className="text-sm">
                <strong>Transfer #{editingTransfer.id}</strong> to{" "}
                <strong>{editingTransfer.recipient_name}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Parcel ID: {editingTransfer.parcel_id}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalState(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteTransferMutation.isPending}
              onClick={() =>
                editingTransfer &&
                deleteTransferMutation.mutate(editingTransfer.id)
              }
            >
              {deleteTransferMutation.isPending
                ? "Deleting..."
                : "Delete Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
