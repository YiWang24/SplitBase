"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Avatar } from "@coinbase/onchainkit/identity";
import { Check, Plus, Search, Star, X } from "lucide-react";
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
  const [newBasename, setNewBasename] = useState("");
  const [newNickname, setNewNickname] = useState("");

  // Load friends from localStorage
  useEffect(() => {
    if (isConnected && address) {
      loadFriends();
    }
  }, [isConnected, address]);

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
        basename: newBasename?.trim() || undefined,
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
    setNewBasename("");
    setShowAddForm(false);
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.basename?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const availableSlots = maxParticipants - selectedFriends.length - 1; // -1 for creator

  return (
    <div className="space-y-4">
      {/* Selected Friends Display */}
      {selectedFriends.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Selected Participants ({selectedFriends.length}/
            {maxParticipants - 1})
          </Label>
          <div className="space-y-2">
            {selectedFriends.map((friend) => (
              <Card key={friend.id} className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        className="h-8 w-8"
                        address={friend.address as `0x${string}`}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          {friend.nickname && (
                            <span className="text-sm font-medium">
                              {friend.nickname}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="font-mono">
                            {friend.address.slice(0, 6)}...
                            {friend.address.slice(-4)}
                          </div>
                          {friend.basename && (
                            <div className="text-primary text-xs">
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
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Friend Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Add Participants</Label>
          <span className="text-xs text-muted-foreground">
            {availableSlots} slots available
          </span>
        </div>

        {!showAddForm ? (
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            disabled={availableSlots <= 0}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Participant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="new-address">Wallet Address *</Label>
                <Input
                  id="new-address"
                  placeholder="0x..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-basename">Base Name (Optional)</Label>
                <Input
                  id="new-basename"
                  placeholder="yourname.base"
                  value={newBasename}
                  onChange={(e) => setNewBasename(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-nickname">Nickname (Optional)</Label>
                <Input
                  id="new-nickname"
                  placeholder="Johnny"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddByAddress} className="flex-1">
                  Add & Select
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Friends List for Selection */}
      {friends.length > 0 && (
        <div>
          <div className="mb-3">
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

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredFriends.map((friend) => {
              const isSelected = selectedFriends.find(
                (f) => f.address === friend.address,
              );
              const isDisabled = !isSelected && availableSlots <= 0;

              return (
                <Card
                  key={friend.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? "bg-primary/10 border-primary/30"
                      : isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent/50"
                  }`}
                  onClick={() => !isDisabled && handleSelectFriend(friend)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          className="h-8 w-8"
                          address={friend.address as `0x${string}`}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            {friend.nickname && (
                              <span className="text-sm font-medium">
                                {friend.nickname}
                              </span>
                            )}
                            {friend.isFavorite && (
                              <Star className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="font-mono">
                              {friend.address.slice(0, 6)}...
                              {friend.address.slice(-4)}
                            </div>
                            {friend.basename && (
                              <div className="text-primary text-xs">
                                {friend.basename}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        {isDisabled && !isSelected && (
                          <span className="text-xs text-muted-foreground">
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
        </div>
      )}

      {/* Empty State */}
      {friends.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No friends added yet</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Friend
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
