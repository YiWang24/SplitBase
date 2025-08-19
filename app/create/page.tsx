"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wallet, Users, DollarSign } from "lucide-react";
import CreateSplitForm from "../components/ui/create-split-form";

export default function CreatePage() {
  const router = useRouter();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Handle message display
  const handleSuccess = (text: string) => {
    setMessage({ type: "success", text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (text: string) => {
    setMessage({ type: "error", text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handle split creation success
  const handleSplitCreated = (billId: string) => {
    handleSuccess("Split created successfully!");
    setTimeout(() => {
      router.push(`/split/${billId}`);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 pb-20">
      {/* Enhanced Header */}
      <div className="mb-8 text-center">
        {/* Main Title with Icon */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-neutral-900" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#c9e265] to-[#89d957] bg-clip-text text-transparent">
            CREATE NEW SPLIT
          </h1>
        </div>

        {/* Enhanced Subtitle */}
        <div className="space-y-3">
          <p className="text-lg text-neutral-700 font-medium">
            Split bills with friends using USDC on Base
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#c9e265]/20 to-[#89d957]/20 rounded-full border border-[#c9e265]/30">
              <Wallet className="h-4 w-4 text-[#c9e265]" />
              <span className="text-xs font-semibold text-neutral-700">
                Web3 Powered
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#89d957]/20 to-[#6bbf3a]/20 rounded-full border border-[#89d957]/30">
              <Users className="h-4 w-4 text-[#89d957]" />
              <span className="text-xs font-semibold text-neutral-700">
                Group Splitting
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#6bbf3a]/20 to-[#b8d14a]/20 rounded-full border border-[#6bbf3a]/30">
              <DollarSign className="h-4 w-4 text-[#6bbf3a]" />
              <span className="text-xs font-semibold text-neutral-700">
                USDC Settlement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm font-medium shadow-lg border-2 transition-all duration-500 ${
            message.type === "success"
              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 shadow-green-100"
              : "bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200 shadow-red-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                message.type === "success" ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            ></div>
            {message.text}
          </div>
        </div>
      )}

      {/* Create Split Form */}
      <div className="space-y-6">
        <CreateSplitForm onSuccess={handleSplitCreated} onError={handleError} />
      </div>

      {/* Bottom Spacing */}
      <div className="h-8"></div>
    </div>
  );
}
