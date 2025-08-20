"use client";

import { Users, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FriendsEmptyStateProps {
  onAddFriend: () => void;
}

export default function FriendsEmptyState({
  onAddFriend,
}: FriendsEmptyStateProps) {
  return (
    <Card className="bg-gradient-to-br from-white/95 to-[#c9e265]/5 border-0 shadow-xl">
      <CardContent className="pt-16 pb-16 text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#c9e265]/20 to-[#89d957]/20 rounded-3xl flex items-center justify-center mb-8">
          <Users className="h-12 w-12 text-[#89d957]" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-700 mb-4">
          No Friends Added Yet
        </h2>
        <p className="text-neutral-600 font-medium mb-8 max-w-md mx-auto">
          Start building your network by adding your first friend. You&apos;ll
          be able to split bills and manage payments together!
        </p>
        <Button
          onClick={onAddFriend}
          className="h-14 px-8 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 text-lg"
        >
          <UserPlus className="mr-3 h-6 w-6" />
          Add Your First Friend
        </Button>
      </CardContent>
    </Card>
  );
}
