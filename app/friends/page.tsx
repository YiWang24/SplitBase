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

import {
  Search,
  Star,
  Edit,
  Trash2,
  UserPlus,
  Users,
  CheckCircle,
  AlertCircle,
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
}

function FriendModal({
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
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please connect your wallet to manage friends
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 pb-20">
      {/* Toast Notifications */}
      {toast && (
        <div className="mb-4">
          <div
            className={`flex items-center justify-between p-3 rounded-lg border ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setToast(null)}
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Friends</h1>
        <p className="text-muted-foreground">
          Manage your contacts for easy bill splitting
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add Friend Button */}
      <div className="mb-6">
        <Button onClick={openAddModal} className="w-full" size="lg">
          <UserPlus className="mr-2 h-4 w-4" />
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
      />

      {/* Friends List */}
      <div className="space-y-4">
        {/* Favorite Friends */}
        {favoriteFriends.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              Favorites ({favoriteFriends.length})
            </h3>
            <div className="space-y-2">
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
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              All Friends ({regularFriends.length})
            </h3>
            <div className="space-y-2">
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
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No friends added yet</p>
              <Button onClick={openAddModal}>
                <UserPlus className="mr-2 h-4 w-4" />
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar
              className="h-10 w-10"
              address={friend.address as `0x${string}`}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {friend.nickname && (
                  <span className="font-medium text-sm">{friend.nickname}</span>
                )}
                {friend.isFavorite && (
                  <Star className="h-3 w-3 text-yellow-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="font-mono">
                  {friend.address.slice(0, 6)}...{friend.address.slice(-4)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="h-8 w-8 p-0"
            >
              <Star
                className={`h-4 w-4 ${friend.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground"}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
            {isDeleting ? (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onConfirmDelete}
                  className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Confirm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelDelete}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
