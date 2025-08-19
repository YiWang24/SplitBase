"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Avatar } from "@coinbase/onchainkit/identity";
import { Check, Plus, Search, Star, X, Users } from "lucide-react";
import { Friend } from "@/lib/types";
import {
  getFriendsFromStorage,
  saveFriendsToStorage,
} from "@/lib/friend-utils";

interface FriendSelectorProps {
  selectedFriends: Friend[];
  onFriendsChange: (friends: Friend[]) => void;
  maxParticipants?: number;
}

export default function FriendSelector({
  selectedFriends,
  onFriendsChange,
  maxParticipants = 50,
}: FriendSelectorProps) {
  const { isConnected, address } = useAccount();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newNickname, setNewNickname] = useState("");

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

  // Load friends from localStorage
  useEffect(() => {
    if (isConnected && address) {
      loadFriends();
    }
  }, [isConnected, address, loadFriends]);

  const saveFriends = useCallback(
    async (newFriends: Friend[]) => {
      if (address) {
        try {
          await saveFriendsToStorage(address, newFriends);
          setFriends(newFriends);
        } catch (error) {
          console.error("Error saving friends:", error);
        }
      }
    },
    [address],
  );

  const handleSelectFriend = (friend: Friend) => {
    if (selectedFriends.find((f) => f.address === friend.address)) {
      // Remove if already selected
      onFriendsChange(
        selectedFriends.filter((f) => f.address !== friend.address),
      );
    } else {
      // Add if not selected and under limit
      if (selectedFriends.length < maxParticipants - 1) {
        // -1 for creator
        onFriendsChange([...selectedFriends, friend]);
      }
    }
  };

  const handleRemoveFriend = (friendAddress: string) => {
    onFriendsChange(selectedFriends.filter((f) => f.address !== friendAddress));
  };

  const handleAddByAddress = async () => {
    if (!newAddress.trim()) return;

    // Check if friend already exists
    const existingFriend = friends.find(
      (f) => f.address.toLowerCase() === newAddress.toLowerCase(),
    );

    if (existingFriend) {
      // If friend exists, add them to selection if not already selected
      if (!selectedFriends.find((f) => f.address === existingFriend.address)) {
        if (selectedFriends.length < maxParticipants - 1) {
          onFriendsChange([...selectedFriends, existingFriend]);
        }
      }
    } else {
      // If friend doesn't exist, create new friend and add to selection
      const newFriend: Friend = {
        id: Date.now().toString(),
        address: newAddress.trim(),
        basename: undefined,
        nickname: newNickname?.trim() || undefined,
        addedAt: new Date(),
        isFavorite: false,
      };

      const updatedFriends = [...friends, newFriend];
      await saveFriends(updatedFriends);

      if (selectedFriends.length < maxParticipants - 1) {
        onFriendsChange([...selectedFriends, newFriend]);
      }
    }

    // Reset form
    setNewAddress("");
    setShowAddForm(false);
  };

  // Filter out already selected friends from the display list
  const filteredFriends = friends
    .filter(
      (friend) =>
        friend.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.basename?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter(
      (friend) => !selectedFriends.find((f) => f.address === friend.address),
    );

  const availableSlots = maxParticipants - selectedFriends.length - 1; // -1 for creator

  return (
    <div className="space-y-4">
      {/* Selected Friends Display */}
      {selectedFriends.length > 0 && (
        <div>
          <Label className="text-sm font-bold text-neutral-700 uppercase tracking-wide mb-3 block">
            Selected Participants ({selectedFriends.length}/
            {maxParticipants - 1})
          </Label>
          <div className="space-y-3">
            {selectedFriends.map((friend) => (
              <Card
                key={friend.id}
                className="bg-gradient-to-r from-[#c9e265]/20 to-[#89d957]/20 border-2 border-[#c9e265] shadow-lg shadow-[#c9e265]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#c9e265]/30"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar
                          className="h-10 w-10 ring-2 ring-[#c9e265] ring-offset-2"
                          address={friend.address as `0x${string}`}
                        />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#c9e265] to-[#89d957] rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          {friend.nickname && (
                            <span className="text-sm font-bold text-[#c9e265]">
                              {friend.nickname}
                            </span>
                          )}
                          <div className="px-2 py-1 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-white text-xs font-bold rounded-full">
                            SELECTED
                          </div>
                        </div>
                        <div className="text-xs space-y-1 mt-1">
                          <div className="font-mono text-[#6bbf3a]">
                            {friend.address.slice(0, 6)}...
                            {friend.address.slice(-4)}
                          </div>
                          {friend.basename && (
                            <div className="text-[#89d957] font-semibold">
                              {friend.basename}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFriend(friend.address)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Friend Section */}
      {isConnected ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
              Add Participants
            </Label>
            <span className="text-xs text-neutral-500 font-medium bg-neutral-100 px-3 py-1 rounded-full">
              {availableSlots} slots available
            </span>
          </div>

          {!showAddForm ? (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              disabled={availableSlots <= 0}
              className={`w-full h-12 font-bold transition-all duration-300 ${
                availableSlots > 0
                  ? "border-2 border-[#89d957]/30 text-[#89d957] hover:bg-[#89d957]/10 hover:border-[#89d957] hover:scale-105"
                  : "border-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          ) : (
            <Card className="border-2 border-[#89d957]/20 bg-gradient-to-br from-[#89d957]/5 to-[#6bbf3a]/5 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-neutral-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#89d957] to-[#6bbf3a] rounded-lg flex items-center justify-center">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                  Add New Participant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="new-address"
                    className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
                  >
                    Wallet Address *
                  </Label>
                  <Input
                    id="new-address"
                    placeholder="0x..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="mt-2 h-12 border-2 border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl placeholder:text-neutral-500 placeholder:font-medium"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="new-nickname"
                    className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
                  >
                    Nickname (Optional)
                  </Label>
                  <Input
                    id="new-nickname"
                    placeholder="Johnny"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="mt-2 h-12 border-2 border-[#6bbf3a]/20 focus:border-[#6bbf3a] focus:ring-[#6bbf3a]/20 transition-all duration-300 rounded-xl placeholder:text-neutral-500 placeholder:font-medium"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button
                    onClick={handleAddByAddress}
                    className="flex-1 h-12 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Add & Select
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 h-12 border-2 border-neutral-300 text-neutral-600 font-bold hover:bg-neutral-50 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl">
          <p className="text-sm text-red-700 font-bold uppercase tracking-wide">
            🔗 CONNECT WALLET TO ADD PARTICIPANTS
          </p>
        </div>
      )}

      {/* Friends List for Selection */}
      {isConnected && friends.length > 0 && (
        <div>
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-neutral-200 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl placeholder:text-neutral-500 placeholder:font-medium"
              />
            </div>
          </div>

          {filteredFriends.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredFriends.map((friend) => {
                const isDisabled = availableSlots <= 0;

                return (
                  <Card
                    key={friend.id}
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-200"
                        : "bg-white border-2 border-neutral-200 hover:border-[#89d957]/40 hover:bg-[#89d957]/5"
                    }`}
                    onClick={() => !isDisabled && handleSelectFriend(friend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar
                              className="h-10 w-10 transition-all duration-300"
                              address={friend.address as `0x${string}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              {friend.nickname && (
                                <span className="text-sm font-bold text-neutral-800">
                                  {friend.nickname}
                                </span>
                              )}
                              {friend.isFavorite && (
                                <Star className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="font-mono text-neutral-500">
                                {friend.address.slice(0, 6)}...
                                {friend.address.slice(-4)}
                              </div>
                              {friend.basename && (
                                <div className="text-[#c9e265]">
                                  {friend.basename}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isDisabled && (
                            <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                              Max reached
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-100">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#c9e265]/20 to-[#89d957]/20 rounded-xl flex items-center justify-center mb-3">
                  <Check className="h-6 w-6 text-[#89d957]" />
                </div>
                <p className="text-neutral-500 font-medium text-sm">
                  {searchTerm
                    ? "No friends found matching your search"
                    : "All available friends have been selected"}
                </p>
                {searchTerm && (
                  <p className="text-xs text-neutral-400 mt-1">
                    Try adjusting your search terms
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {isConnected && friends.length === 0 && !showAddForm && (
        <Card className="border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-100">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#c9e265]/20 to-[#89d957]/20 rounded-2xl flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500 font-medium mb-4">
              No friends added yet
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Friend
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
