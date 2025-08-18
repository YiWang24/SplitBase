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
import CompletionModal from "./completion-modal";

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
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Fetch bill details
  const fetchBillDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/split/${billId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const newBill = result.data;
        const oldStatus = bill?.status;
        setBill(newBill);

        // Show completion modal if status changed from non-completed to completed
        if (oldStatus !== "completed" && newBill.status === "completed") {
          setShowCompletionModal(true);
        }
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

  // Create NFT receipt
  const handleCreateNFT = async () => {
    // TODO: Implement NFT receipt generation logic
    // This can integrate with NFT minting services
    onSuccess("NFT receipt generation feature coming soon!");
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
    <div className="space-y-6">
      {/* Split Title and Status */}
      <Card className="backdrop-blur-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-1">{bill.title}</CardTitle>
              {bill.description && (
                <CardDescription>{bill.description}</CardDescription>
              )}
            </div>
            <Badge className={getStatusColor(bill.status)}>
              {getStatusText(bill.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-foreground">
                {formatAmount(bill.totalAmount, 2)} USDC
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Each Pays</p>
              <p className="text-2xl font-bold text-primary">
                {formatAmount(bill.amountPerPerson, 2)} USDC
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Completion Progress</span>
              <span>{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {stats.paidParticipants}/{bill.participantCount} people paid
              </span>
              <span>{formatAmount(stats.totalPaid, 2)} USDC received</span>
            </div>
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="w-full"
          >
            <Share className="mr-2 h-4 w-4" />
            Share Split
          </Button>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card className="backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg">
            Participants ({bill.participants.length}/{bill.participantCount})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Participants */}
          <div className="space-y-4">
            {bill.participants.map((participant: Participant) => (
              <div key={participant.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <OnchainAvatar
                      address={participant.address as `0x${string}`}
                      className="w-8 h-8"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">
                          {participant.displayName}
                        </span>
                        {/* Show Creator badge for creator */}
                        {participant.address.toLowerCase() ===
                          bill.creatorAddress.toLowerCase() && (
                          <Badge variant="default" className="text-xs">
                            Creator
                          </Badge>
                        )}
                        {/* Show You badge for current user */}
                        {participant.address.toLowerCase() ===
                          address?.toLowerCase() && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatAddress(participant.address)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Show amount for all participants */}
                    <p className="text-sm font-medium text-foreground">
                      {formatAmount(participant.amount, 2)} USDC
                    </p>

                    {/* Show different status for creator vs other participants */}
                    {participant.address.toLowerCase() ===
                    bill.creatorAddress.toLowerCase() ? (
                      // Creator shows as Recipient
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-blue-600">Recipient</span>
                      </div>
                    ) : (
                      // Other participants show payment status
                      <div className="flex items-center gap-1">
                        {participant.status === "paid" ||
                        participant.status === "confirmed" ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">Paid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs text-yellow-600">
                              Pending
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Button */}
                {participant.address.toLowerCase() === address?.toLowerCase() &&
                  participant.status === "pending" &&
                  bill.status === "active" && (
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
                  )}
              </div>
            ))}

            {/* Empty Slots - Only show if there are still available slots */}
            {bill.participants.length < bill.participantCount &&
              Array.from({
                length: bill.participantCount - bill.participants.length,
              }).map((_, index) => (
                <div key={`empty-${index}`} className="opacity-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground">
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
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isJoining ? "Joining..." : "Join Split"}
        </Button>
      )}

      {/* Cannot Join Message */}
      {!isCreator && !userParticipant && !canJoinResult.canJoin && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            {canJoinResult.reason || "Cannot join this split"}
          </p>
        </div>
      )}

      {/* Wallet Not Connected Message */}
      {!address && (
        <div className="text-center py-4">
          <p className="text-yellow-600">
            Please connect wallet to participate in split
          </p>
        </div>
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

      {/* Completion Modal */}
      {bill && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          bill={bill}
          onCreateNFT={handleCreateNFT}
        />
      )}
    </div>
  );
}
