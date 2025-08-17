"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp, Star, Crown, Sparkles } from "lucide-react";
import { Friend } from "@/lib/types";
import { getFriendsFromStorage, getTopFriends } from "@/lib/friend-utils";

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

  // Load friends from localStorage on mount
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

  const topFriends = getTopFriends(friends, 20); // Show top 20 friends

  if (!isConnected) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardContent className="pt-6 text-center">
            <Users className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
            <p className="text-zinc-300">
              Please connect your wallet to view the leaderboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 pb-20 bg-gradient-to-b from-zinc-900 via-zinc-900 to-black min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/25">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              Leaderboard
            </h1>
            <p className="text-zinc-400 text-base">
              Top friends by intimacy score
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-600/50 shadow-lg">
            <div className="text-2xl font-bold text-amber-400 mb-1">
              {topFriends.length}
            </div>
            <div className="text-xs text-zinc-400 font-medium">
              Total Ranked
            </div>
          </div>
          <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-600/50 shadow-lg">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {friends.filter((f) => f.isFavorite).length}
            </div>
            <div className="text-xs text-zinc-400 font-medium">Favorites</div>
          </div>
          <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-600/50 shadow-lg">
            <div className="text-2xl font-bold text-emerald-400 mb-1">
              {friends.filter((f) => f.nickname).length}
            </div>
            <div className="text-xs text-zinc-400 font-medium">
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
                className="bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm border-zinc-600/50 hover:border-zinc-500/70 hover:shadow-2xl hover:shadow-zinc-900/30 transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex items-center space-x-5">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-orange-500/30 relative">
                          <Crown className="w-7 h-7" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-ping"></div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-16 h-16 bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-zinc-400/30">
                          <Trophy className="w-7 h-7" />
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-amber-600/30">
                          <Star className="w-7 h-7" />
                        </div>
                      )}
                      {index > 2 && (
                        <div className="w-16 h-16 bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-800 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-zinc-500/50 shadow-lg">
                          #{index + 1}
                        </div>
                      )}
                    </div>

                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {friend.nickname && (
                          <span className="font-bold text-xl text-white">
                            {friend.nickname}
                          </span>
                        )}
                        {friend.isFavorite && (
                          <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Star className="h-3 w-3 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-zinc-300 space-y-1">
                        <div className="font-mono text-xs bg-zinc-800/50 px-2 py-1 rounded-md inline-block">
                          {friend.address.slice(0, 6)}...
                          {friend.address.slice(-4)}
                        </div>
                        {friend.basename && (
                          <div className="text-xs text-cyan-400 font-medium bg-cyan-900/20 px-2 py-1 rounded-md inline-block">
                            {friend.basename}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Intimacy Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center justify-end space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-zinc-400 font-medium">
                          Score
                        </span>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                        {intimacyScore}
                      </div>
                      <div className="text-xs text-zinc-500 font-medium">
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
        <Card className="bg-gradient-to-br from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm border-zinc-600/50 rounded-xl">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-zinc-600 to-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-zinc-400" />
            </div>
            <p className="text-zinc-300 text-lg mb-6 font-medium">
              No friends added yet
            </p>
            <Button
              onClick={() => (window.location.href = "/friends")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 px-8 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/25"
            >
              <Users className="mr-2 h-5 w-5" />
              Add Friends
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer Stats */}
      {topFriends.length > 0 && (
        <div className="mt-10 p-6 bg-gradient-to-r from-zinc-800/60 to-zinc-700/60 backdrop-blur-sm rounded-2xl border border-zinc-600/50 shadow-xl">
          <div className="text-center">
            <div className="text-sm text-zinc-400 mb-3 font-medium">
              Leaderboard powered by
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              Intimacy Algorithm
            </div>
            <div className="text-xs text-zinc-500 font-medium">
              Based on favorites, nicknames, Base domains & time
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
