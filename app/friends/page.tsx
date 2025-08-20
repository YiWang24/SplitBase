"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import WalletNotConnected from "@/app/components/ui/wallet-not-connected";
import { Users } from "lucide-react";
import { Friend, AddFriendInput } from "@/lib/types";

// Import new components
import FriendModal from "@/app/components/ui/friend-modal";
import ToastNotification from "@/app/components/ui/toast-notification";
import FriendsHeader from "@/app/components/ui/friends-header";
import FriendsSearch from "@/app/components/ui/friends-search";
import FriendsList from "@/app/components/ui/friends-list";
import FriendsEmptyState from "@/app/components/ui/friends-empty-state";

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

  const loadFriends = useCallback(async () => {
    if (address) {
      try {
        const response = await fetch(`/api/friends?address=${address}`);
        const result = await response.json();

        if (result.success) {
          setFriends(result.data);
        } else {
          console.error("Error loading friends:", result.error);
          setFriends([]);
        }
      } catch (error) {
        console.error("Error loading friends:", error);
        setFriends([]);
      }
    }
  }, [address]);

  // Load friends from API on mount
  useEffect(() => {
    if (isConnected && address) {
      loadFriends();
    }
  }, [isConnected, address, loadFriends]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleModalSubmit = async (
    data: AddFriendInput & { isFavorite?: boolean },
  ) => {
    if (modalMode === "add") {
      if (address) {
        try {
          const response = await fetch(`/api/friends?userAddress=${address}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: data.address.trim(),
              nickname: data.nickname?.trim() || undefined,
            }),
          });

          const result = await response.json();

          if (result.success) {
            setFriends((prev) => [...prev, result.data]);
            setToast({
              type: "success",
              message: "Friend added successfully!",
            });
          } else {
            throw new Error(result.error || "Failed to add friend");
          }
        } catch (error) {
          console.error("Error adding friend:", error);
          setToast({
            type: "error",
            message: "Failed to add friend. Please try again.",
          });
        }
      }
    } else if (modalMode === "edit" && editingFriend) {
      if (address) {
        try {
          const response = await fetch("/api/friends", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: editingFriend.id,
              address: data.address.trim(),
              nickname: data.nickname?.trim() || editingFriend.nickname,
              isFavorite:
                data.isFavorite !== undefined
                  ? data.isFavorite
                  : editingFriend.isFavorite,
            }),
          });

          const result = await response.json();

          if (result.success) {
            setFriends((prev) =>
              prev.map((f) => (f.id === editingFriend.id ? result.data : f)),
            );

            setToast({
              type: "success",
              message: "Friend updated successfully!",
            });
          } else {
            throw new Error(result.error || "Failed to update friend");
          }
        } catch (error) {
          console.error("Error updating friend:", error);
          setToast({
            type: "error",
            message: "Failed to update friend. Please try again.",
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

  const handleDeleteFriend = async (friendId: string) => {
    if (address) {
      try {
        const response = await fetch(
          `/api/friends?id=${friendId}&address=${address}`,
          {
            method: "DELETE",
          },
        );

        const result = await response.json();

        if (result.success) {
          setFriends((prev) => prev.filter((f) => f.id !== friendId));
          setToast({
            type: "success",
            message: "Friend deleted successfully!",
          });
          setDeletingFriendId(null);
        } else {
          throw new Error(result.error || "Failed to delete friend");
        }
      } catch (error) {
        console.error("Error deleting friend:", error);
        setToast({
          type: "error",
          message: "Failed to delete friend. Please try again.",
        });
      }
    }
  };

  const confirmDelete = (friendId: string) => {
    setDeletingFriendId(friendId);
  };

  const cancelDelete = () => {
    setDeletingFriendId(null);
  };

  const handleToggleFavorite = async (friendId: string) => {
    if (address) {
      try {
        const response = await fetch(
          `/api/friends?id=${friendId}&address=${address}`,
          {
            method: "PATCH",
          },
        );

        const result = await response.json();

        if (result.success) {
          setFriends((prev) =>
            prev.map((f) => (f.id === friendId ? result.data : f)),
          );

          setToast({
            type: "success",
            message: result.data.isFavorite
              ? "Friend added to favorites!"
              : "Friend removed from favorites!",
          });
        } else {
          throw new Error(result.error || "Failed to update favorite status");
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        setToast({
          type: "error",
          message: "Failed to update favorite status. Please try again.",
        });
      }
    }
  };

  // Helper functions for sorting and filtering
  const searchFriends = (friends: Friend[], searchTerm: string): Friend[] => {
    if (!searchTerm.trim()) return friends;

    const term = searchTerm.toLowerCase();
    return friends.filter(
      (friend) =>
        friend.address.toLowerCase().includes(term) ||
        friend.nickname?.toLowerCase().includes(term) ||
        friend.basename?.toLowerCase().includes(term),
    );
  };

  const getSortedFriends = (friends: Friend[]): Friend[] => {
    return [...friends].sort((a, b) => {
      // First sort by favorite status
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // Then sort by nickname or address
      const aName = a.nickname || a.address;
      const bName = b.nickname || b.address;

      return aName.localeCompare(bName);
    });
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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20">
      {/* Toast Notifications */}
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Section */}
      <FriendsHeader />

      {/* Search and Add Section */}
      <FriendsSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddFriend={openAddModal}
      />

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

      {/* Friends List or Empty State */}
      {friends.length > 0 ? (
        <FriendsList
          favoriteFriends={favoriteFriends}
          regularFriends={regularFriends}
          onEdit={openEditModal}
          onDelete={confirmDelete}
          onToggleFavorite={handleToggleFavorite}
          onConfirmDelete={handleDeleteFriend}
          onCancelDelete={cancelDelete}
          deletingFriendId={deletingFriendId}
        />
      ) : (
        <FriendsEmptyState onAddFriend={openAddModal} />
      )}
    </div>
  );
}
