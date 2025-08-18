"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface WalletNotConnectedProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function WalletNotConnected({
  icon: Icon,
  title,
  description,
  className = "",
}: WalletNotConnectedProps) {
  return (
    <div className={`w-full max-w-4xl mx-auto px-4 min-h-screen flex items-center justify-center ${className}`}>
      <Card className="bg-gradient-to-br from-white/95 to-[#c9e265]/5 border-2 border-[#c9e265]/20 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group w-full">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#c9e265]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#c9e265]/10 to-[#89d957]/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-[#89d957]/10 to-[#c9e265]/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-700" />

        <CardContent className="pt-20 pb-20 text-center relative z-10">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#c9e265]/20 to-[#89d957]/20 rounded-3xl flex items-center justify-center mb-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group-hover:rotate-3">
            <Icon className="h-12 w-12 text-[#c9e265] transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h2 className="text-2xl font-black text-neutral-800 mb-4 tracking-wide group-hover:text-neutral-900 transition-colors duration-300">
            {title}
          </h2>
          <p className="text-lg text-neutral-600 font-medium max-w-md mx-auto leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
