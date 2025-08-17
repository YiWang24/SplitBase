"use client";

import { useState, useEffect } from "react";
import { Check, Star, Trophy } from "lucide-react";
import { SplitBill } from "@/lib/types";
import { formatAmount, calculateBillStats } from "@/lib/split-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: SplitBill;
  onCreateNFT?: () => void;
}

export default function CompletionModal({
  isOpen,
  onClose,
  bill,
  onCreateNFT,
}: CompletionModalProps) {
  const [isCreatingNFT, setIsCreatingNFT] = useState(false);
  const [completedAt, setCompletedAt] = useState<string>("");

  useEffect(() => {
    // Set the completed date only on client side to avoid hydration mismatch
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

  const handleCreateNFT = async () => {
    if (!onCreateNFT) return;

    setIsCreatingNFT(true);
    try {
      await onCreateNFT();
    } catch (error) {
      console.error("Error creating NFT:", error);
    } finally {
      setIsCreatingNFT(false);
    }
  };

  if (!isOpen) return null;

  const stats = calculateBillStats(bill);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          {/* Success Animation */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>

          <DialogTitle className="text-xl font-bold">
            🎉 Split Completed!
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            All participants have completed payment
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">{bill.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-foreground">
                    {formatAmount(bill.totalAmount, 2)} USDC
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Participants</p>
                  <p className="font-bold text-foreground">
                    {bill.participantCount} people
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Each Paid</p>
                  <p className="font-bold text-primary">
                    {formatAmount(bill.amountPerPerson, 2)} USDC
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed At</p>
                  <p className="font-bold text-foreground text-xs">
                    {completedAt || "Loading..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>
                  Participants ({stats.paidParticipants}/{bill.participantCount}
                  )
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  <Trophy className="mr-1 h-3 w-3" />
                  Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bill.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">
                      {participant.displayName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">
                        {formatAmount(participant.amount, 2)} USDC
                      </span>
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NFT Receipt */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                  <Star className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1 space-y-2">
                  <h5 className="font-medium text-gray-800">
                    Generate NFT Receipt
                  </h5>
                  <p className="text-sm text-gray-600">
                    Mint this split record as an NFT for permanent digital
                    receipt storage
                  </p>

                  {bill.nftReceiptId ? (
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        NFT Receipt Generated
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCreateNFT}
                      disabled={isCreatingNFT}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {isCreatingNFT ? "Generating..." : "Generate NFT Receipt"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📊 Split Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center rounded bg-green-50 p-2">
                  <p className="font-bold text-green-600">100%</p>
                  <p className="text-green-700">Completion Rate</p>
                </div>
                <div className="text-center rounded bg-blue-50 p-2">
                  <p className="font-bold text-blue-600">
                    {stats.paidParticipants}
                  </p>
                  <p className="text-blue-700">Paid Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Tips */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              💡 All transactions completed on Base network
            </p>
            <p className="text-xs text-muted-foreground">
              🔗 Data saved, view history anytime
            </p>
          </div>

          {/* Close Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="w-full"
          >
            Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
