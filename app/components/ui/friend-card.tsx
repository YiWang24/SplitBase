"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit, Trash2 } from "lucide-react";
import { Friend } from "@/lib/types";
import { Avatar } from "@coinbase/onchainkit/identity";

interface FriendCardProps {
  friend: Friend;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isDeleting: boolean;
}

export default function FriendCard({
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
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Friend Info Section */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <Avatar
                className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-[#c9e265]/20 group-hover:ring-[#c9e265] transition-all duration-300"
                address={friend.address as `0x${string}`}
              />
              {friend.isFavorite && (
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white fill-current" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                {friend.nickname && (
                  <span className="font-bold text-base sm:text-lg text-neutral-900 truncate">
                    {friend.nickname}
                  </span>
                )}
                {friend.isFavorite && (
                  <div className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md flex-shrink-0">
                    FAVORITE
                  </div>
                )}
              </div>
              <div className="text-xs sm:text-sm text-neutral-600 font-mono bg-neutral-100 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg break-all">
                {friend.address.slice(0, 6)}...{friend.address.slice(-4)}
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className={`h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full transition-all duration-300 ${
                friend.isFavorite
                  ? "text-yellow-500 hover:bg-yellow-50"
                  : "text-neutral-400 hover:text-yellow-500 hover:bg-yellow-50"
              }`}
            >
              <Star
                className={`h-4 w-4 sm:h-5 sm:w-5 ${friend.isFavorite ? "fill-current" : ""}`}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-[#89d957] hover:bg-[#89d957]/10 rounded-full transition-all duration-300"
            >
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {isDeleting ? (
              <div className="flex items-center space-x-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onConfirmDelete}
                  className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full font-bold transition-all duration-300"
                >
                  Confirm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelDelete}
                  className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full font-bold transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
