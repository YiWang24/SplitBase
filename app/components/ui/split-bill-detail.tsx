"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { SplitBill, Participant } from "@/lib/types";
import {
  calculateBillStats,
  formatAmount,
  formatAddress,
  canJoinBill,
} from "@/lib/split-utils";
import {
  Plus,
  Share,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Receipt,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { Avatar as OnchainAvatar } from "@coinbase/onchainkit/identity";
import PaymentButton from "./payment-button";
import ShareModal from "./share-modal";
import { useRouter } from "next/navigation";

interface SplitBillDetailProps {
  billId: string;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export default function SplitBillDetail({
  billId,
  onError,
  onSuccess,
}: SplitBillDetailProps) {
  const { address } = useAccount();
  const [bill, setBill] = useState<SplitBill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const router = useRouter();

  // Fetch bill details
  const fetchBillDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/split/${billId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const newBill = result.data;
        setBill(newBill);
      } else {
        onError(result.error || "Failed to fetch split details");
      }
    } catch (error) {
      console.error("Error fetching bill detail:", error);
      onError("Network error, please retry");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillDetail();
  }, [billId, refreshKey]);

  // Join split bill
  const handleJoinBill = async () => {
    if (!address || !bill) return;

    const canJoinResult = canJoinBill(bill, address);
    if (!canJoinResult.canJoin) {
      onError(canJoinResult.reason || "Cannot join split");
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch(`/api/split/${billId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "join",
          billId,
          participantAddress: address,
          // TODO: Get user's Basename
          participantBasename: undefined,
          displayName: undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess("Successfully joined split!");
        setRefreshKey((prev) => prev + 1); // Trigger reload
      } else {
        onError(result.error || "Failed to join split");
      }
    } catch (error) {
      console.error("Error joining bill:", error);
      onError("Network error, please retry");
    } finally {
      setIsJoining(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (
    participantId: string,
    txHash: string,
  ) => {
    try {
      const response = await fetch(`/api/split/${billId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "payment",
          participantId,
          transactionHash: txHash,
          status: "paid",
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess("Payment successful!");
        setRefreshKey((prev) => prev + 1); // Trigger reload
      } else {
        onError(result.error || "Payment status update failed");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      onError("Payment status update failed");
    }
  };

  // Open share modal
  const handleShare = () => {
    setShowShareModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Split does not exist or has been deleted
        </p>
      </div>
    );
  }

  const stats = calculateBillStats(bill);
  const userParticipant = address
    ? bill.participants.find(
        (p) => p.address.toLowerCase() === address.toLowerCase(),
      )
    : null;
  const isCreator =
    address && bill.creatorAddress.toLowerCase() === address.toLowerCase();
  const canJoinResult = address
    ? canJoinBill(bill, address)
    : { canJoin: false };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "active":
        return "Active";
      default:
        return "Cancelled";
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Split Title and Status */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 font-bold tracking-wide text-neutral-900">
                {bill.title.toUpperCase()}
              </CardTitle>
              {bill.description && (
                <CardDescription className="text-sm text-neutral-600 leading-relaxed">
                  {bill.description}
                </CardDescription>
              )}
            </div>
            <Badge
              className={`px-3 py-1 text-xs font-bold tracking-wide rounded-full border-2 ${getStatusColor(bill.status)}`}
            >
              {getStatusText(bill.status).toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Amount Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-[var(--brand-primary)]/10 to-[var(--brand-primary)]/5 rounded-xl border border-[var(--brand-primary)]/20">
              <p className="text-xs font-medium tracking-wide text-neutral-600 mb-2">
                TOTAL AMOUNT
              </p>
              <p className="text-2xl font-bold text-[var(--brand-primary)]">
                {formatAmount(bill.totalAmount, 2)} USDC
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[var(--brand-secondary)]/10 to-[var(--brand-secondary)]/5 rounded-xl border border-[var(--brand-secondary)]/20">
              <p className="text-xs font-medium tracking-wide text-neutral-600 mb-2">
                EACH PAYS
              </p>
              <p className="text-2xl font-bold text-[var(--brand-secondary)]">
                {formatAmount(bill.amountPerPerson, 2)} USDC
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-neutral-50 to-[var(--brand-primary)]/5 rounded-xl border border-neutral-200/50">
            <div className="flex justify-between text-sm font-medium text-neutral-700">
              <span>COMPLETION PROGRESS</span>
              <span className="text-[var(--brand-primary)]">
                {stats.completionRate}%
              </span>
            </div>
            <Progress
              value={stats.completionRate}
              className="w-full h-3 bg-neutral-200"
            />
            <div className="flex justify-between text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                {stats.paidParticipants}/{bill.participantCount} people paid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[var(--brand-primary)] rounded-full"></span>
                {formatAmount(stats.totalPaid, 2)} USDC received
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="w-full border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 hover:border-[var(--brand-primary)]/70 transition-all duration-300"
            >
              <Share className="mr-2 h-4 w-4" />
              Share Split
            </Button>

            {/* View Receipt Button - Only show for completed bills */}
            {bill.status === "completed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/receipts/${bill.id}`)}
                className="w-full border-[var(--brand-secondary)] text-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/10 hover:border-[var(--brand-secondary)]/70 transition-all duration-300"
              >
                <Receipt className="mr-2 h-4 w-4" />
                View Receipt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold tracking-wide text-neutral-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--brand-secondary)]" />
            PARTICIPANTS ({bill.participants.length}/{bill.participantCount})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Participants */}
          <div className="space-y-4">
            {bill.participants.map(
              (participant: Participant, index: number) => (
                <div
                  key={participant.id}
                  className="space-y-3 p-3 rounded-lg bg-gradient-to-r from-white/80 to-neutral-50/80 border border-neutral-200/50 hover:border-[var(--brand-primary)]/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <OnchainAvatar
                          address={participant.address as `0x${string}`}
                          className="w-10 h-10 border-2 border-white shadow-md"
                        />
                        {/* Show Creator badge for creator */}
                        {participant.address.toLowerCase() ===
                          bill.creatorAddress.toLowerCase() && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-primary)] rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-[8px] font-bold text-white">
                              C
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-neutral-900">
                            {participant.displayName}
                          </span>
                          {/* Show You badge for current user */}
                          {participant.address.toLowerCase() ===
                            address?.toLowerCase() && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-2 py-0.5 bg-[var(--brand-secondary)]/20 border-[var(--brand-secondary)] text-[var(--brand-secondary)]"
                            >
                              YOU
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 font-mono">
                          {formatAddress(participant.address)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* Show amount for all participants */}
                      <p className="text-sm font-bold text-neutral-900 mb-1">
                        {formatAmount(participant.amount, 2)} USDC
                      </p>

                      {/* Show different status for creator vs other participants */}
                      {participant.address.toLowerCase() ===
                      bill.creatorAddress.toLowerCase() ? (
                        // Creator shows as Recipient
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                            RECIPIENT
                          </span>
                        </div>
                      ) : (
                        // Other participants show payment status
                        <div className="flex items-center justify-end gap-1">
                          {participant.status === "paid" ||
                          participant.status === "confirmed" ? (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              PAID
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              PENDING
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Button */}
                  {participant.address.toLowerCase() ===
                    address?.toLowerCase() &&
                    participant.status === "pending" &&
                    bill.status === "active" && (
                      <div className="pt-2 border-t border-neutral-200/50">
                        <PaymentButton
                          recipientAddress={bill.creatorAddress}
                          amount={participant.amount}
                          onSuccess={(txHash) =>
                            handlePaymentSuccess(participant.id, txHash)
                          }
                          onError={(txHash) =>
                            handlePaymentSuccess(participant.id, txHash)
                          }
                        />
                      </div>
                    )}
                </div>
              ),
            )}

            {/* Empty Slots - Only show if there are still available slots */}
            {bill.participants.length < bill.participantCount &&
              Array.from({
                length: bill.participantCount - bill.participants.length,
              }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="opacity-60 p-3 rounded-lg bg-gradient-to-r from-neutral-100/50 to-neutral-50/50 border border-dashed border-neutral-300/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center border-2 border-dashed border-neutral-300">
                      <User className="h-5 w-5 text-neutral-400" />
                    </div>
                    <span className="text-neutral-500 font-medium">
                      Waiting for participant to join
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Join Split Button */}
      {!isCreator && !userParticipant && canJoinResult.canJoin && address && (
        <Button
          size="lg"
          onClick={handleJoinBill}
          disabled={isJoining}
          className="w-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:from-[var(--brand-primary-dark)] hover:to-[var(--brand-secondary-dark)] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-bold tracking-wide"
        >
          <Plus className="mr-2 h-5 w-5" />
          {isJoining ? "JOINING..." : "JOIN SPLIT"}
        </Button>
      )}

      {/* Cannot Join Message */}
      {!isCreator && !userParticipant && !canJoinResult.canJoin && (
        <Card className="text-center p-6 bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200/50">
          <CardContent className="space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="text-red-700 font-medium">
              {canJoinResult.reason || "Cannot join this split"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Wallet Not Connected Message */}
      {!address && (
        <Card className="text-center p-6 bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-2 border-yellow-200/50">
          <CardContent className="space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-yellow-500" />
            <p className="text-yellow-700 font-medium">
              Please connect wallet to participate in split
            </p>
          </CardContent>
        </Card>
      )}

      {/* Share Modal */}
      {bill && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={bill.shareUrl || ""}
          billTitle={bill.title}
          amount={formatAmount(bill.amountPerPerson, 2)}
        />
      )}

      {/* Completion Modal - Removed auto-popup */}
      {/* {bill && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          bill={bill}
          onCreateNFT={handleCreateNFT}
        />
      )} */}
    </div>
  );
}
