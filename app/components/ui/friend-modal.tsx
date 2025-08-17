"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Friend, AddFriendInput } from "@/lib/types";
import { isValidEthereumAddress } from "@/lib/friend-utils";

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  friend?: Friend | null;
  onSubmit: (data: AddFriendInput & { isFavorite?: boolean }) => void;
  existingAddresses: string[];
}

export default function FriendModal({
  isOpen,
  onClose,
  mode,
  friend,
  onSubmit,
  existingAddresses,
}: FriendModalProps) {
  const [formData, setFormData] = useState<
    AddFriendInput & { isFavorite?: boolean }
  >({
    address: "",
    nickname: "",
    isFavorite: false,
  });
  const [addressError, setAddressError] = useState<string>("");

  // Reset form when modal opens/closes or friend changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && friend) {
        setFormData({
          address: friend.address,
          nickname: friend.nickname || "",
          isFavorite: friend.isFavorite,
        });
      } else {
        setFormData({
          address: "",
          nickname: "",
          isFavorite: false,
        });
      }
      setAddressError("");
    }
  }, [isOpen, mode, friend]);

  // Validate address input in real-time
  useEffect(() => {
    if (formData.address.trim()) {
      const trimmedAddress = formData.address.trim();

      if (!isValidEthereumAddress(trimmedAddress)) {
        setAddressError("Please enter a valid Ethereum address");
      } else if (
        mode === "add" &&
        existingAddresses.some(
          (addr) => addr.toLowerCase() === trimmedAddress.toLowerCase(),
        )
      ) {
        setAddressError("This address is already in your friends list");
      } else if (
        mode === "edit" &&
        friend &&
        existingAddresses.some(
          (addr) =>
            addr.toLowerCase() === trimmedAddress.toLowerCase() &&
            addr.toLowerCase() !== friend.address.toLowerCase(),
        )
      ) {
        setAddressError("This address is already in your friends list");
      } else {
        setAddressError("");
      }
    } else {
      setAddressError("");
    }
  }, [formData.address, existingAddresses, mode, friend]);

  const handleSubmit = () => {
    if (!formData.address.trim() || addressError) return;

    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      address: "",
      nickname: "",
      isFavorite: false,
    });
    setAddressError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Friend" : "Edit Friend"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter your friend's wallet address and details"
              : "Update your friend's information"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="modal-address">Wallet Address *</Label>
            <Input
              id="modal-address"
              placeholder="0x..."
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className={
                addressError ? "border-red-500 focus:border-red-500" : ""
              }
            />
            {addressError && (
              <div className="flex items-center space-x-2 mt-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{addressError}</span>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="modal-nickname">Nickname (Optional)</Label>
            <Input
              id="modal-nickname"
              placeholder="Johnny"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
            />
          </div>
          {mode === "edit" && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="modal-favorite"
                checked={formData.isFavorite}
                onChange={(e) =>
                  setFormData({ ...formData, isFavorite: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="modal-favorite">Mark as favorite</Label>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-row items-center justify-end space-x-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!!addressError || !formData.address.trim()}
            className="min-w-[120px]"
          >
            {mode === "add" ? "Add Friend" : "Update Friend"}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
