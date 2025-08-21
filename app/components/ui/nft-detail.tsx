"use client";

import { NFTData } from "@/lib/nft-types";
import {
  Star,
  Users,
  Coins,
  MapPin,
  Clock,
  Hash,
  Shield,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { generateCompleteNFT } from "@/lib/nft-compositor";

interface NFTDetailProps {
  nft: NFTData;
  showHeader?: boolean;
  compact?: boolean;
}

export default function NFTDetail({
  nft,
  showHeader = true,
  compact = false,
}: NFTDetailProps) {
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateImage = async () => {
      try {
        setIsGenerating(true);
        // Convert NFTData to NFTGenerationParams format
        const params = {
          billId: nft.billId,
          billTitle: nft.metadata.title,
          totalAmount: nft.metadata.totalAmount,
          participants: nft.metadata.participants,
          location: nft.metadata.location,
          timeOfDay: nft.metadata.timeOfDay,
        };

        const imageData = await generateCompleteNFT(params);
        setGeneratedImage(imageData);
      } catch (error) {
        console.error("Error generating NFT image:", error);
        // Fallback to original imageData if generation fails
        setGeneratedImage(nft.imageData);
      } finally {
        setIsGenerating(false);
      }
    };

    generateImage();
  }, [nft]);

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
    <div
      className={`${compact ? "p-4" : "min-h-screen bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5"}`}
    >
      <div
        className={`${compact ? "" : "container mx-auto px-4 py-6 max-w-6xl"}`}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">
                  {nft.metadata.title}
                </h1>
                <p className="text-sm text-neutral-500">NFT Receipt Details</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge
                className={`${getRarityColor(nft.metadata.rarity)} text-sm font-bold px-3 py-1`}
              >
                {nft.metadata.rarity}
              </Badge>
            </div>
          </div>
        )}

        {/* NFT Content */}
        <div
          className={`grid grid-cols-1 ${compact ? "gap-4" : "lg:grid-cols-2 gap-8"}`}
        >
          {/* Left Column - NFT Image and Stats */}
          <div className="space-y-6">
            {/* NFT Image */}
            <div className="relative">
              {isGenerating ? (
                <div
                  className={`w-full h-auto rounded-2xl border-4 border-brand-primary shadow-2xl ${compact ? "max-w-xs mx-auto" : ""} bg-gray-100 flex items-center justify-center`}
                  style={{ aspectRatio: "4/5" }}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Generating NFT...</p>
                  </div>
                </div>
              ) : (
                <img
                  src={generatedImage || nft.imageData}
                  alt={nft.metadata.title}
                  className={`w-full h-auto rounded-2xl border-4 border-brand-primary shadow-2xl ${compact ? "max-w-xs mx-auto" : ""}`}
                />
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-white rounded-2xl border-2 border-brand-primary/20 shadow-lg">
                <Coins className="w-8 h-8 text-brand-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-neutral-700">
                  {nft.metadata.totalAmount.toFixed(0)}
                </p>
                <p className="text-sm text-neutral-500 font-medium">
                  Total USDC
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-2xl border-2 border-brand-secondary/20 shadow-lg">
                <Users className="w-8 h-8 text-brand-secondary mx-auto mb-3" />
                <p className="text-3xl font-bold text-neutral-700">
                  {nft.metadata.participantCount}
                </p>
                <p className="text-sm text-neutral-500 font-medium">
                  Participants
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - NFT Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 shadow-lg">
              <h3 className="font-semibold text-neutral-700 flex items-center mb-4 text-lg">
                <Hash className="w-5 h-5 mr-2 text-brand-primary" />
                NFT Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                    <span className="font-medium text-neutral-600">
                      Location
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-700">
                    {nft.metadata.locationDisplayName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-brand-primary" />
                    <span className="font-medium text-neutral-600">
                      Time Cycle
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-700">
                    {nft.metadata.timeDisplayName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-brand-primary" />
                    <span className="font-medium text-neutral-600">
                      Created
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-700">
                    {new Date(nft.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 shadow-lg">
              <h3 className="font-semibold text-neutral-700 flex items-center mb-4 text-lg">
                <Users className="w-5 h-5 mr-2 text-brand-primary" />
                Participants ({nft.metadata.participantCount})
              </h3>

              <div className="space-y-3">
                {nft.metadata.participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-neutral-700">
                        {participant}
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-600">
                      {nft.metadata.amountPerPerson.toFixed(2)} USDC
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 shadow-lg">
              <h3 className="font-semibold text-neutral-700 flex items-center mb-4 text-lg">
                <Shield className="w-5 h-5 mr-2 text-brand-primary" />
                Technical Details
              </h3>

              <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 font-medium">NFT ID:</span>
                  <span className="font-mono text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
                    {nft.id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 font-medium">Bill ID:</span>
                  <span className="font-mono text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
                    {nft.billId}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-neutral-500 font-medium">Rarity:</span>
                  <Badge
                    className={`${getRarityColor(nft.metadata.rarity)} text-xs px-2 py-1`}
                  >
                    {nft.metadata.rarity}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!compact && (
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <div className="flex items-center justify-center space-x-8 text-sm text-neutral-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Base Network Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>SplitBase NFT Receipt</span>
              </div>
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4" />
                <span>Unique Digital Collectible</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
