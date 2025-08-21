"use client";

import { Search, UserPlus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface FriendsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddFriend: () => void;
}

export default function FriendsSearch({
  searchTerm,
  onSearchChange,
  onAddFriend,
}: FriendsSearchProps) {
  const router = useRouter();

  return (
    <div className="mb-6 space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 border-2 border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl text-base placeholder:text-neutral-400 placeholder:font-medium"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Add Friend Button */}
        <Button
          onClick={onAddFriend}
          className="h-12 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add Friend
        </Button>

        {/* Friends Ranking Button */}
        <Button
          onClick={() => router.push("/friends")}
          variant="outline"
          className="h-12 border-2 border-[#89d957]/30 text-[#89d957] font-bold hover:bg-[#89d957]/10 hover:border-[#89d957] transition-all duration-300 rounded-xl"
        >
          <Trophy className="mr-2 h-5 w-5" />
          Ranking
        </Button>
      </div>
    </div>
  );
}
