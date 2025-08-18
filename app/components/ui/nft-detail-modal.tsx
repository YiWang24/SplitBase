"use client";

import {
  X,
  Calendar,
  Users,
  Coins,
  MapPin,
  Clock,
  Star,
  Hash,
  Shield,
} from "lucide-react";
import { NFTData } from "@/lib/nft-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/lib/split-utils";

interface NFTDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTData | null;
}

export default function NFTDetailModal({
  isOpen,
  onClose,
  nft,
}: NFTDetailModalProps) {
  if (!isOpen || !nft) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-brand-xl border-2 border-brand-primary">
        {/* Header */}
        <div className="sticky top-0 bg-brand-gradient p-4 text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{nft.metadata.title}</h2>
                <p className="text-sm opacity-90">NFT Receipt Details</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NFT Image */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={nft.imageData}
                  alt={nft.metadata.title}
                  className="w-full h-auto rounded-xl border-2 border-brand-primary shadow-brand-lg"
                />

                {/* Rarity Badge */}
                <div className="absolute top-4 right-4">
                  <Badge
                    className={`${getRarityColor(nft.metadata.rarity)} text-sm font-bold shadow-lg`}
                  >
                    {nft.metadata.rarity}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                  <Coins className="w-6 h-6 text-brand-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-700">
                    {formatAmount(nft.metadata.totalAmount, 0)}
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    Total USDC
                  </p>
                </div>

                <div className="text-center p-4 bg-brand-secondary/5 rounded-xl border border-brand-secondary/20">
                  <Users className="w-6 h-6 text-brand-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-700">
                    {nft.metadata.participantCount}
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    Participants
                  </p>
                </div>
              </div>
            </div>

            {/* NFT Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-700 flex items-center">
                  <Hash className="w-4 h-4 mr-2 text-brand-primary" />
                  NFT Information
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-brand-primary" />
                      <span className="text-sm font-medium text-neutral-600">
                        Location
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-700">
                      {nft.metadata.locationDisplayName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-brand-primary" />
                      <span className="text-sm font-medium text-neutral-600">
                        Time Cycle
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-700">
                      {nft.metadata.timeDisplayName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-brand-primary" />
                      <span className="text-sm font-medium text-neutral-600">
                        Created
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-700">
                      {new Date(nft.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Participants */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-700 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-brand-primary" />
                  Participants ({nft.metadata.participantCount})
                </h3>

                <div className="space-y-2">
                  {nft.metadata.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-brand-gradient rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-neutral-700">
                          {participant}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-neutral-600">
                        {formatAmount(nft.metadata.amountPerPerson, 2)} USDC
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Technical Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-700 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-brand-primary" />
                  Technical Details
                </h3>

                <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">NFT ID:</span>
                    <span className="font-mono text-neutral-700">{nft.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Bill ID:</span>
                    <span className="font-mono text-neutral-700">
                      {nft.billId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Rarity:</span>
                    <Badge
                      className={`${getRarityColor(nft.metadata.rarity)} text-xs`}
                    >
                      {nft.metadata.rarity}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-center space-x-6 text-xs text-neutral-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Base Network Security</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>SplitBase NFT Receipt</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
