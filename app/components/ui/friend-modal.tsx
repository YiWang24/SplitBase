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
import { UserPlus, AlertCircle } from "lucide-react";
import { Friend, AddFriendInput } from "@/lib/types";
import { isValidEthereumAddress } from "@/lib/friend-utils";

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  friend?: Friend | null;
  onSubmit: (data: AddFriendInput & { isFavorite?: boolean }) => void;
  existingAddresses: string[];
  currentUserAddress?: string;
}

export default function FriendModal({
  isOpen,
  onClose,
  mode,
  friend,
  onSubmit,
  existingAddresses,
  currentUserAddress,
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
        currentUserAddress &&
        trimmedAddress.toLowerCase() === currentUserAddress.toLowerCase()
      ) {
        setAddressError("You cannot add your own wallet address");
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
        currentUserAddress &&
        trimmedAddress.toLowerCase() === currentUserAddress.toLowerCase()
      ) {
        setAddressError("You cannot use your own wallet address");
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
  }, [formData.address, existingAddresses, mode, friend, currentUserAddress]);

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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-[#fefce8] border-2 border-[#c9e265]/20 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <UserPlus className="h-8 w-8 text-neutral-900" />
          </div>
          <DialogTitle className="text-2xl font-black text-neutral-900 tracking-wide">
            {mode === "add" ? "ADD NEW FRIEND" : "EDIT FRIEND"}
          </DialogTitle>
          <DialogDescription className="text-base text-neutral-600 font-medium">
            {mode === "add"
              ? "Enter your friend's wallet address and details"
              : "Update your friend's information"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label
              htmlFor="modal-address"
              className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
            >
              WALLET ADDRESS *
            </Label>
            <Input
              id="modal-address"
              placeholder="0x..."
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className={`mt-2 h-12 border-2 transition-all duration-300 rounded-xl ${
                addressError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20"
              }`}
            />
            {addressError && (
              <div className="flex items-center space-x-2 mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">{addressError}</span>
              </div>
            )}
          </div>
          <div>
            <Label
              htmlFor="modal-nickname"
              className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
            >
              NICKNAME (OPTIONAL)
            </Label>
            <Input
              id="modal-nickname"
              placeholder="Johnny"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              className="mt-2 h-12 border-2 border-[#89d957]/20 focus:border-[#89d957] focus:ring-[#89d957]/20 transition-all duration-300 rounded-xl"
            />
          </div>
          {mode === "edit" && (
            <div className="flex items-center space-x-3 bg-gradient-to-r from-[#c9e265]/10 to-[#89d957]/10 p-4 rounded-xl border border-[#c9e265]/20">
              <input
                type="checkbox"
                id="modal-favorite"
                checked={formData.isFavorite}
                onChange={(e) =>
                  setFormData({ ...formData, isFavorite: e.target.checked })
                }
                className="w-5 h-5 rounded border-2 border-[#c9e265] text-[#c9e265] focus:ring-[#c9e265]/20"
              />
              <Label
                htmlFor="modal-favorite"
                className="text-sm font-bold text-neutral-700"
              >
                Mark as favorite
              </Label>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-row items-center justify-end space-x-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!!addressError || !formData.address.trim()}
            className="min-w-[120px] h-12 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0"
          >
            {mode === "add" ? "Add Friend" : "Update Friend"}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="min-w-[120px] h-12 border-2 border-neutral-300 text-neutral-600 font-bold hover:bg-neutral-50 transition-all duration-300"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
