"use client";

import { Crown, Users } from "lucide-react";
import { Friend } from "@/lib/types";
import FriendCard from "./friend-card";

interface FriendsListProps {
  favoriteFriends: Friend[];
  regularFriends: Friend[];
  onEdit: (friend: Friend) => void;
  onDelete: (friendId: string) => void;
  onToggleFavorite: (friendId: string) => void;
  onConfirmDelete: (friendId: string) => void;
  onCancelDelete: () => void;
  deletingFriendId: string | null;
}

export default function FriendsList({
  favoriteFriends,
  regularFriends,
  onEdit,
  onDelete,
  onToggleFavorite,
  onConfirmDelete,
  onCancelDelete,
  deletingFriendId,
}: FriendsListProps) {
  return (
    <div className="space-y-6">
      {/* Favorite Friends */}
      {favoriteFriends.length > 0 && (
        <div>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-[#c9e265]/20 to-[#89d957]/20 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border-2 border-[#c9e265]/30">
              <h3 className="text-sm sm:text-base font-black text-neutral-900 tracking-wide flex items-center">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-yellow-500" />
                FAVORITE FRIENDS ({favoriteFriends.length})
              </h3>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {favoriteFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onEdit={() => onEdit(friend)}
                onDelete={() => onDelete(friend.id)}
                onToggleFavorite={() => onToggleFavorite(friend.id)}
                onConfirmDelete={() => onConfirmDelete(friend.id)}
                onCancelDelete={onCancelDelete}
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
            <div className="bg-gradient-to-r from-neutral-100 to-neutral-200 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border-2 border-neutral-300">
              <h3 className="text-sm sm:text-base font-black text-neutral-700 tracking-wide flex items-center">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-neutral-500" />
                ALL FRIENDS ({regularFriends.length})
              </h3>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {regularFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onEdit={() => onEdit(friend)}
                onDelete={() => onDelete(friend.id)}
                onToggleFavorite={() => onToggleFavorite(friend.id)}
                onConfirmDelete={() => onConfirmDelete(friend.id)}
                onCancelDelete={onCancelDelete}
                isDeleting={deletingFriendId === friend.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
