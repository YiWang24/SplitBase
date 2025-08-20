"use client";

import { Users } from "lucide-react";

export default function FriendsHeader() {
  return (
    <div className="mb-6 text-center">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-2xl flex items-center justify-center shadow-lg mb-4">
        <Users className="h-8 w-8 text-neutral-900" />
      </div>
      <h1 className="text-2xl font-black text-neutral-900 tracking-wide mb-2">
        FRIENDS
      </h1>
      <p className="text-sm text-neutral-600 font-medium max-w-md mx-auto">
        Manage your contacts for easy bill splitting
      </p>
    </div>
  );
}
