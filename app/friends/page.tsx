"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
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
import WalletNotConnected from "@/app/components/ui/wallet-not-connected";

import {
  Search,
  Star,
  Edit,
  Trash2,
  UserPlus,
  Users,
  CheckCircle,
  AlertCircle,
  Crown,
} from "lucide-react";
import { Friend, AddFriendInput } from "@/lib/types";
import {
  getFriendsFromStorage,
  addFriend,
  updateFriend,
  deleteFriend,
  toggleFriendFavorite,
  searchFriends,
  getSortedFriends,
  isValidEthereumAddress,
} from "@/lib/friend-utils";
import { Avatar } from "@coinbase/onchainkit/identity";

// FriendModal Component
interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  friend?: Friend | null;
  onSubmit: (data: AddFriendInput & { isFavorite?: boolean }) => void;
  existingAddresses: string[];
  currentUserAddress?: string;
}

function FriendModal({
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

export default function FriendsPage() {
  const { isConnected, address } = useAccount();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deletingFriendId, setDeletingFriendId] = useState<string | null>(null);

  // Load friends from localStorage on mount
  useEffect(() => {
    if (isConnected && address) {
      loadFriends();
    }
  }, [isConnected, address]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadFriends = useCallback(async () => {
    if (address) {
      try {
        const friends = await getFriendsFromStorage(address);
        setFriends(friends);
      } catch (error) {
        console.error("Error loading friends:", error);
        setFriends([]);
      }
    }
  }, [address]);

  const handleModalSubmit = (
    data: AddFriendInput & { isFavorite?: boolean },
  ) => {
    if (modalMode === "add") {
      if (address) {
        const newFriend = addFriend(address, {
          address: data.address.trim(),
          nickname: data.nickname?.trim() || undefined,
        });

        setFriends((prev) => [...prev, newFriend]);

        setToast({
          type: "success",
          message: "Friend added successfully!",
        });
      }
    } else if (modalMode === "edit" && editingFriend) {
      if (address) {
        const updatedFriend = updateFriend(address, editingFriend.id, {
          address: data.address.trim(),
          nickname: data.nickname?.trim() || editingFriend.nickname,
          isFavorite:
            data.isFavorite !== undefined
              ? data.isFavorite
              : editingFriend.isFavorite,
        });

        if (updatedFriend) {
          setFriends((prev) =>
            prev.map((f) => (f.id === editingFriend.id ? updatedFriend : f)),
          );

          setToast({
            type: "success",
            message: "Friend updated successfully!",
          });
        }
      }
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditingFriend(null);
    setShowModal(true);
  };

  const openEditModal = (friend: Friend) => {
    setModalMode("edit");
    setEditingFriend(friend);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFriend(null);
  };

  const handleDeleteFriend = (friendId: string) => {
    if (address && deleteFriend(address, friendId)) {
      setFriends((prev) => prev.filter((f) => f.id !== friendId));

      setToast({
        type: "success",
        message: "Friend deleted successfully!",
      });

      setDeletingFriendId(null);
    }
  };

  const confirmDelete = (friendId: string) => {
    setDeletingFriendId(friendId);
  };

  const cancelDelete = () => {
    setDeletingFriendId(null);
  };

  const handleToggleFavorite = (friendId: string) => {
    if (address) {
      const updatedFriend = toggleFriendFavorite(address, friendId);
      if (updatedFriend) {
        setFriends((prev) =>
          prev.map((f) => (f.id === friendId ? updatedFriend : f)),
        );

        setToast({
          type: "success",
          message: updatedFriend.isFavorite
            ? "Friend added to favorites!"
            : "Friend removed from favorites!",
        });
      }
    }
  };

  const filteredFriends = searchFriends(friends, searchTerm);
  const sortedFriends = getSortedFriends(filteredFriends);
  const favoriteFriends = sortedFriends.filter((f) => f.isFavorite);
  const regularFriends = sortedFriends.filter((f) => !f.isFavorite);
  const existingAddresses = friends.map((f) => f.address);

  if (!isConnected) {
    return (
      <WalletNotConnected
        icon={Users}
        title="Wallet Not Connected"
        description="Please connect your wallet to manage friends"
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-20">
      {/* Toast Notifications */}
      {toast && (
        <div className="mb-6">
          <div
            className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-lg ${
              toast.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
                : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-3">
              {toast.type === "success" ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="text-sm font-bold">{toast.message}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setToast(null)}
              className="h-8 w-8 p-0 hover:bg-transparent"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Users className="h-8 w-8 text-neutral-900" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-wide mb-2">
          FRIENDS
        </h1>
        <p className="text-sm text-neutral-600 font-medium max-w-md mx-auto">
          Manage your contacts for easy bill splitting
        </p>
      </div>

      {/* Search and Add Section */}
      <div className="mb-6 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl text-base placeholder:text-neutral-400 placeholder:font-medium"
          />
        </div>

        {/* Add Friend Button */}
        <Button
          onClick={openAddModal}
          className="w-full h-12 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add New Friend
        </Button>
      </div>

      {/* Friend Modal */}
      <FriendModal
        isOpen={showModal}
        onClose={closeModal}
        mode={modalMode}
        friend={editingFriend}
        onSubmit={handleModalSubmit}
        existingAddresses={existingAddresses}
        currentUserAddress={address}
      />

      {/* Friends List */}
      <div className="space-y-6">
        {/* Favorite Friends */}
        {favoriteFriends.length > 0 && (
          <div>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-[#c9e265]/20 to-[#89d957]/20 px-4 py-2 rounded-xl border-2 border-[#c9e265]/30">
                <h3 className="text-base font-black text-neutral-900 tracking-wide flex items-center">
                  <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                  FAVORITE FRIENDS ({favoriteFriends.length})
                </h3>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {favoriteFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onEdit={() => openEditModal(friend)}
                  onDelete={() => confirmDelete(friend.id)}
                  onToggleFavorite={() => handleToggleFavorite(friend.id)}
                  onConfirmDelete={() => handleDeleteFriend(friend.id)}
                  onCancelDelete={cancelDelete}
                  isDeleting={deletingFriendId === friend.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Friends */}
        {regularFriends.length > 0 && (
          <div>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-neutral-100 to-neutral-200 px-4 py-2 rounded-xl border-2 border-neutral-300">
                <h3 className="text-base font-black text-neutral-700 tracking-wide flex items-center">
                  <Users className="h-4 w-4 mr-3 text-neutral-500" />
                  ALL FRIENDS ({regularFriends.length})
                </h3>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {regularFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onEdit={() => openEditModal(friend)}
                  onDelete={() => confirmDelete(friend.id)}
                  onToggleFavorite={() => handleToggleFavorite(friend.id)}
                  onConfirmDelete={() => handleDeleteFriend(friend.id)}
                  onCancelDelete={cancelDelete}
                  isDeleting={deletingFriendId === friend.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {friends.length === 0 && (
          <Card className="bg-gradient-to-br from-white/95 to-[#c9e265]/5 border-0 shadow-xl">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#c9e265]/20 to-[#89d957]/20 rounded-3xl flex items-center justify-center mb-8">
                <Users className="h-12 w-12 text-[#89d957]" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-700 mb-4">
                No Friends Added Yet
              </h2>
              <p className="text-neutral-600 font-medium mb-8 max-w-md mx-auto">
                Start building your network by adding your first friend.
                You&apos;ll be able to split bills and manage payments together!
              </p>
              <Button
                onClick={openAddModal}
                className="h-14 px-8 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 text-lg"
              >
                <UserPlus className="mr-3 h-6 w-6" />
                Add Your First Friend
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface FriendCardProps {
  friend: Friend;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isDeleting: boolean;
}

function FriendCard({
  friend,
  onEdit,
  onDelete,
  onToggleFavorite,
  onConfirmDelete,
  onCancelDelete,
  isDeleting,
}: FriendCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#c9e265]/20 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Avatar
                className="h-14 w-14 ring-2 ring-[#c9e265]/20 group-hover:ring-[#c9e265] transition-all duration-300"
                address={friend.address as `0x${string}`}
              />
              {friend.isFavorite && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-3 w-3 text-white fill-current" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                {friend.nickname && (
                  <span className="font-bold text-lg text-neutral-900">
                    {friend.nickname}
                  </span>
                )}
                {friend.isFavorite && (
                  <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                    FAVORITE
                  </div>
                )}
              </div>
              <div className="text-sm text-neutral-600 font-mono bg-neutral-100 px-3 py-2 rounded-lg">
                {friend.address.slice(0, 8)}...{friend.address.slice(-6)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className={`h-10 w-10 p-0 rounded-full transition-all duration-300 ${
                friend.isFavorite
                  ? "text-yellow-500 hover:bg-yellow-50"
                  : "text-neutral-400 hover:text-yellow-500 hover:bg-yellow-50"
              }`}
            >
              <Star
                className={`h-5 w-5 ${friend.isFavorite ? "fill-current" : ""}`}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-10 w-10 p-0 text-[#89d957] hover:bg-[#89d957]/10 rounded-full transition-all duration-300"
            >
              <Edit className="h-5 w-5" />
            </Button>

            {isDeleting ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onConfirmDelete}
                  className="h-10 px-4 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full font-bold transition-all duration-300"
                >
                  Confirm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelDelete}
                  className="h-10 px-4 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full font-bold transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
