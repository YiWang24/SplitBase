"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Star,
  Trophy,
  Zap,
  Shield,
  Users,
  Coins,
  Clock,
  Hash,
  ExternalLink,
} from "lucide-react";
import { SplitBill } from "@/lib/types";
import { calculateBillStats, formatAmount } from "@/lib/split-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NFTCreationModal from "./nft-creation-modal";
import { getNFTByBillId } from "@/lib/nft-storage";

interface ReceiptDetailProps {
  billId?: string;
  bill?: SplitBill;
  onCreateNFT?: () => Promise<void> | void;
  isWalletConnected?: boolean;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-neutral-200 animate-spin"></div>
      <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
    </div>
  </div>
);

export default function ReceiptDetail({
  billId,
  bill: billProp,
  onCreateNFT,
  isWalletConnected = false,
}: ReceiptDetailProps) {
  const [bill, setBill] = useState<SplitBill | null>(billProp ?? null);
  const [completedAt, setCompletedAt] = useState<string>("");
  const [isCreatingNFT, setIsCreatingNFT] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [nftExists, setNftExists] = useState(false);
  const [existingNFTId, setExistingNFTId] = useState<string>("");

  useEffect(() => {
    setCompletedAt(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  useEffect(() => {
    const fetchBill = async () => {
      if (!billId || bill) return;
      try {
        setIsLoading(true);
        const response = await fetch(`/api/split/${billId}`);
        const result = await response.json();
        if (result?.success && result?.data) {
          setBill(result.data as SplitBill);
        }
      } catch {
        // noop for now
      } finally {
        setIsLoading(false);
      }
    };
    fetchBill();
  }, [billId, bill]);

  // Check if NFT already exists for this bill
  useEffect(() => {
    const checkExistingNFT = async () => {
      if (!bill?.id) return;
      try {
        const existingNFT = await getNFTByBillId(bill.id);
        if (existingNFT) {
          setNftExists(true);
          setExistingNFTId(existingNFT.id);
        }
      } catch (error) {
        console.error("Error checking existing NFT:", error);
      }
    };
    checkExistingNFT();
  }, [bill]);

  const handleCreateNFT = async () => {
    if (onCreateNFT) {
      setIsCreatingNFT(true);
      try {
        await onCreateNFT();
      } finally {
        setIsCreatingNFT(false);
      }
    } else {
      setShowNFTModal(true);
    }
  };

  const handleNFTCreated = (nftId: string) => {
    setNftExists(true);
    setExistingNFTId(nftId);
    setShowNFTModal(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!bill) return null;

  const stats = calculateBillStats(bill);

  return (
    <div className="min-h-screen bg-soft-gradient p-4">
      {/* Single Receipt Card */}
      <Card className="max-w-md mx-auto bg-white shadow-brand-xl border-0 overflow-hidden">
        {/* Receipt Header */}
        <div className="relative bg-brand-gradient p-6 text-white">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Hash className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium opacity-90">
                  Digital Receipt
                </span>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                <Trophy className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            </div>

            <h1 className="text-xl font-bold mb-2">{bill.title}</h1>

            <div className="flex items-center justify-between text-sm opacity-90">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{completedAt}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Base Network</span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Amount Summary */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                <Coins className="w-6 h-6 text-brand-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-neutral-700">
                  {formatAmount(bill.totalAmount, 2)}
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  Total USDC
                </p>
              </div>

              <div className="text-center p-4 bg-brand-secondary/5 rounded-xl border border-brand-secondary/20">
                <Users className="w-6 h-6 text-brand-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold text-neutral-700">
                  {bill.participantCount}
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  Participants
                </p>
              </div>
            </div>

            {/* Per Person Amount */}
            <div className="bg-gradient-to-r from-brand-primaryLight/20 to-brand-secondaryLight/20 p-4 rounded-xl border border-brand-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">
                    Amount Per Person
                  </p>
                  <p className="text-2xl font-bold text-brand-accent">
                    {formatAmount(bill.amountPerPerson, 2)}{" "}
                    <span className="text-lg">USDC</span>
                  </p>
                </div>
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-200" />

          {/* Participants List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-700 flex items-center">
                <Users className="w-4 h-4 mr-2 text-brand-primary" />
                Participants ({stats.paidParticipants}/{bill.participantCount})
              </h3>
              <Badge className="bg-success-light text-success-dark border-success-main/30">
                All Complete
              </Badge>
            </div>

            <div className="space-y-3">
              {bill.participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg border border-neutral-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-neutral-700">
                      {participant.displayName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-neutral-600">
                      {formatAmount(participant.amount, 2)} USDC
                    </span>
                    <div className="w-6 h-6 bg-success-main rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-neutral-200" />

          {/* NFT Section - Only show if wallet is connected or NFT already exists */}
          {(isWalletConnected || bill.nftReceiptId || nftExists) && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-brand-accent/10 rounded-xl border border-brand-primary/20">
                <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-neutral-700 mb-1 flex items-center">
                    NFT Receipt
                    <Zap className="w-4 h-4 ml-2 text-brand-primary" />
                  </h4>
                  <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                    Mint this split record as an NFT for permanent digital
                    receipt storage
                  </p>

                  {bill.nftReceiptId || nftExists ? (
                    <div className="flex items-center justify-between p-3 bg-success-light rounded-lg border border-success-main/30">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-success-dark" />
                        <span className="text-sm font-medium text-success-dark">
                          NFT Receipt Generated
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-success-main/50 text-success-dark hover:bg-success-main/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleCreateNFT}
                      disabled={isCreatingNFT}
                      className="w-full bg-brand-gradient hover:bg-brand-gradient-dark text-white font-semibold py-2.5 rounded-lg shadow-brand transition-all duration-200 hover:shadow-brand-lg disabled:opacity-50"
                    >
                      {isCreatingNFT ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          Generate NFT Receipt
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {(isWalletConnected || bill.nftReceiptId || nftExists) && (
            <Separator className="bg-neutral-200" />
          )}

          {/* Footer */}
          <div className="text-center space-y-3 pt-2">
            <div className="flex items-center justify-center space-x-6 text-xs text-neutral-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Base Network Security</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Instant Settlement</span>
              </div>
            </div>
            <div className="w-16 h-1 bg-brand-gradient rounded-full mx-auto"></div>
            <p className="text-xs text-neutral-400 font-mono">
              Receipt ID: {bill.id?.slice(0, 8)}...{bill.id?.slice(-8)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* NFT Creation Modal */}
      {bill && (
        <NFTCreationModal
          isOpen={showNFTModal}
          onClose={() => setShowNFTModal(false)}
          bill={bill}
          onNFTCreated={handleNFTCreated}
        />
      )}
    </div>
  );
}
