"use client";

import { useState } from "react";
import { Calendar, Users, Coins, MapPin, Clock, Star } from "lucide-react";
import { NFTData } from "@/lib/nft-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatAmount } from "@/lib/split-utils";

interface NFTCardProps {
  nft: NFTData;
  onClick: (nft: NFTData) => void;
  size?: "small" | "medium" | "large";
}

export default function NFTCard({
  nft,
  onClick,
  size = "medium",
}: NFTCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: "w-full h-36", // 列表模式：全宽，适当高度确保文字完整显示
    medium: "w-full h-36", // 统一使用列表模式
    large: "w-full h-36", // 统一使用列表模式
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "EPIC":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "RARE":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      default:
        return "bg-neutral-200 text-neutral-700";
    }
  };

  return (
    <Card
      className={`${sizeClasses[size]} cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-brand-lg border-2 border-brand-primary/20 hover:border-brand-primary bg-white overflow-hidden group flex`}
      onClick={() => onClick(nft)}
    >
      {/* NFT Image */}
      <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden w-1/3 h-full">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-neutral-500">Loading...</p>
                </div>
              </div>
            )}
            <img
              src={nft.imageData}
              alt={nft.metadata.title}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
            <div className="text-center">
              <Star className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Image unavailable</p>
            </div>
          </div>
        )}

        {/* Rarity Badge */}
        <div className="absolute top-2 right-2">
          <Badge
            className={`${getRarityColor(nft.metadata.rarity)} text-xs font-bold shadow-lg`}
          >
            {nft.metadata.rarity}
          </Badge>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-sm font-semibold text-neutral-700">
                View Details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Info */}
      <CardContent className="p-4 flex flex-col justify-between min-w-0 flex-1 h-full">
        <div className="space-y-2 min-w-0">
          {/* Title */}
          <h3 className="font-bold text-neutral-800 text-sm leading-tight">
            {nft.metadata.title}
          </h3>

          {/* Location & Time */}
          <div className="flex items-center space-x-2 text-xs text-neutral-500 min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0 text-neutral-400" />
            <span className="leading-tight">
              {nft.metadata.locationDisplayName}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-neutral-500 min-w-0">
            <Clock className="w-3 h-3 flex-shrink-0 text-neutral-400" />
            <span className="leading-tight">
              {nft.metadata.timeDisplayName}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-2 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 min-w-0 cursor-help">
                  <Coins className="w-3 h-3 text-brand-primary flex-shrink-0" />
                  <span className="text-xs font-semibold text-neutral-700 leading-tight">
                    {typeof nft.metadata.totalAmount === "number"
                      ? nft.metadata.totalAmount.toFixed(0)
                      : formatAmount(String(nft.metadata.totalAmount), 0)}{" "}
                    USDC
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Total Amount:{" "}
                  {typeof nft.metadata.totalAmount === "number"
                    ? nft.metadata.totalAmount.toFixed(2)
                    : formatAmount(String(nft.metadata.totalAmount), 2)}{" "}
                  USDC
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center space-x-1 min-w-0">
            <Users className="w-3 h-3 text-brand-secondary flex-shrink-0" />
            <span className="text-xs font-semibold text-neutral-600">
              {nft.metadata.participantCount}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center space-x-1 mt-1 pt-2 border-t border-neutral-100 min-w-0">
          <Calendar className="w-3 h-3 text-neutral-400 flex-shrink-0" />
          <span className="text-xs text-neutral-400">
            {new Date(nft.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
