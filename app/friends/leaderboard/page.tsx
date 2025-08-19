"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp, Star, Crown, Sparkles } from "lucide-react";
import { Friend } from "@/lib/types";
import { getFriendsFromStorage, getTopFriends } from "@/lib/friend-utils";
import WalletNotConnected from "@/app/components/ui/wallet-not-connected";

// Calculate intimacy score for a friend
const calculateIntimacyScore = (friend: Friend): number => {
  let score = 0;

  // Favorite friends get bonus points
  if (friend.isFavorite) score += 100;

  // Friends with nicknames get bonus points (more personal)
  if (friend.nickname) score += 50;

  // Friends with .base domains get bonus points (more established)
  if (friend.basename) score += 30;

  // Add points based on when they were added (newer friends get slight bonus)
  if (friend.addedAt) {
    const daysSinceAdded = Math.floor(
      (Date.now() - new Date(friend.addedAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    score += Math.max(0, 20 - daysSinceAdded); // Newer friends get up to 20 points
  }

  return score;
};

export default function LeaderboardPage() {
  const { isConnected, address } = useAccount();
  const [friends, setFriends] = useState<Friend[]>([]);

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

  // Load friends from localStorage on mount
  useEffect(() => {
    if (isConnected && address) {
      loadFriends();
    }
  }, [isConnected, address, loadFriends]);

  const topFriends = getTopFriends(friends, 20); // Show top 20 friends

  if (!isConnected) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <WalletNotConnected
          icon={Trophy}
          title="Wallet Not Connected"
          description="Please connect your wallet to view the leaderboard"
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 pb-20 bg-gradient-to-b from-[var(--neutral-50)] via-[var(--neutral-100)] to-[var(--neutral-50)] min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-accent)] rounded-full flex items-center justify-center shadow-2xl shadow-[var(--brand-primary)]/25">
              <Trophy className="h-8 w-8 text-neutral-900" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-accent)] rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-3 w-3 text-neutral-900" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-accent)] bg-clip-text text-transparent mb-2">
              LEADERBOARD
            </h1>
            <p className="text-neutral-600 text-base font-medium">
              Top friends by intimacy score
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border-2 border-[var(--brand-primary)]/30 shadow-lg">
            <div className="text-2xl font-bold text-[var(--brand-primary)] mb-1">
              {topFriends.length}
            </div>
            <div className="text-xs text-neutral-600 font-medium">
              Total Ranked
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border-2 border-[var(--brand-secondary)]/30 shadow-lg">
            <div className="text-2xl font-bold text-[var(--brand-secondary)] mb-1">
              {friends.filter((f) => f.isFavorite).length}
            </div>
            <div className="text-xs text-neutral-600 font-medium">
              Favorites
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border-2 border-[var(--brand-accent)]/30 shadow-lg">
            <div className="text-2xl font-bold text-[var(--brand-accent)] mb-1">
              {friends.filter((f) => f.nickname).length}
            </div>
            <div className="text-xs text-neutral-600 font-medium">
              With Nicknames
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {topFriends.length > 0 ? (
        <div className="space-y-4">
          {topFriends.map((friend, index) => {
            const intimacyScore = calculateIntimacyScore(friend);

            return (
              <Card
                key={friend.id}
                className="bg-white/95 backdrop-blur-sm border-2 border-[var(--brand-primary)]/30 hover:border-[var(--brand-primary)]/50 hover:shadow-xl hover:shadow-[var(--brand-primary)]/20 transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex items-center space-x-5">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-accent)] rounded-full flex items-center justify-center text-neutral-900 text-2xl font-bold shadow-2xl shadow-[var(--brand-primary)]/30 relative">
                          <Crown className="w-7 h-7" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-accent)] rounded-full animate-ping"></div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-accent)] rounded-full flex items-center justify-center text-neutral-900 text-2xl font-bold shadow-2xl shadow-[var(--brand-secondary)]/30">
                          <Trophy className="w-7 h-7" />
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand-accent)] to-[var(--brand-secondary)] rounded-full flex items-center justify-center text-neutral-900 text-2xl font-bold shadow-2xl shadow-[var(--brand-accent)]/30">
                          <Star className="w-7 h-7" />
                        </div>
                      )}
                      {index > 2 && (
                        <div className="w-16 h-16 bg-gradient-to-br from-[var(--neutral-200)] to-[var(--neutral-300)] rounded-full flex items-center justify-center text-neutral-700 text-xl font-bold border-2 border-[var(--neutral-400)]/50 shadow-lg">
                          #{index + 1}
                        </div>
                      )}
                    </div>

                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {friend.nickname && (
                          <span className="font-bold text-xl text-neutral-900">
                            {friend.nickname}
                          </span>
                        )}
                        {friend.isFavorite && (
                          <div className="w-6 h-6 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full flex items-center justify-center">
                            <Star className="h-3 w-3 text-neutral-900 fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-neutral-600 space-y-1">
                        <div className="font-mono text-xs bg-neutral-100/80 px-2 py-1 rounded-md inline-block border border-neutral-200/50">
                          {friend.address.slice(0, 6)}...
                          {friend.address.slice(-4)}
                        </div>
                        {friend.basename && (
                          <div className="text-xs text-[var(--brand-accent)] font-medium bg-[var(--brand-accent)]/10 px-2 py-1 rounded-md inline-block border border-[var(--brand-accent)]/20">
                            {friend.basename}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Intimacy Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center justify-end space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-[var(--brand-accent)]" />
                        <span className="text-sm text-neutral-600 font-medium">
                          Score
                        </span>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-secondary)] bg-clip-text text-transparent mb-1">
                        {intimacyScore}
                      </div>
                      <div className="text-xs text-neutral-500 font-medium">
                        {index === 0
                          ? "Champion"
                          : index === 1
                            ? "Runner-up"
                            : index === 2
                              ? "Bronze"
                              : "Contender"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-[var(--brand-primary)]/30 rounded-xl shadow-lg">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[var(--brand-primary)]/30">
              <Trophy className="h-10 w-10 text-[var(--brand-primary)]" />
            </div>
            <p className="text-neutral-700 text-lg mb-6 font-medium">
              No friends added yet
            </p>
            <Button
              onClick={() => (window.location.href = "/friends")}
              className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:from-[var(--brand-primary-dark)] hover:to-[var(--brand-secondary-dark)] text-neutral-900 border-0 px-8 py-3 rounded-xl font-medium shadow-lg shadow-[var(--brand-primary)]/25"
            >
              <Users className="mr-2 h-5 w-5" />
              Add Friends
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer Stats */}
      {topFriends.length > 0 && (
        <div className="mt-10 p-6 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-[var(--brand-primary)]/20 shadow-xl">
          <div className="text-center">
            <div className="text-sm text-neutral-600 mb-3 font-medium">
              Leaderboard powered by
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-accent)] bg-clip-text text-transparent mb-2">
              Intimacy Algorithm
            </div>
            <div className="text-xs text-neutral-500 font-medium">
              Based on favorites, nicknames, Base domains & time
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
