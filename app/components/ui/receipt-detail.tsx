"use client";

import { useEffect, useState } from "react";
import { Check, Star, Trophy } from "lucide-react";
import { SplitBill } from "@/lib/types";
import { calculateBillStats, formatAmount } from "@/lib/split-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ReceiptDetailProps {
  billId?: string;
  bill?: SplitBill;
  onCreateNFT?: () => Promise<void> | void;
}

export default function ReceiptDetail({
  billId,
  bill: billProp,
  onCreateNFT,
}: ReceiptDetailProps) {
  const [bill, setBill] = useState<SplitBill | null>(billProp ?? null);
  const [completedAt, setCompletedAt] = useState<string>("");
  const [isCreatingNFT, setIsCreatingNFT] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      } catch (e) {
        // noop for now
      } finally {
        setIsLoading(false);
      }
    };
    fetchBill();
  }, [billId, bill]);

  const handleCreateNFT = async () => {
    if (!onCreateNFT) return;
    setIsCreatingNFT(true);
    try {
      await onCreateNFT();
    } finally {
      setIsCreatingNFT(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bill) return null;

  const stats = calculateBillStats(bill);

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-base">{bill.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {formatAmount(bill.totalAmount, 2)} USDC
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Participants</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
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
              <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                {completedAt || "Loading..."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>
              Participants ({stats.paidParticipants}/{bill.participantCount})
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
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
                <span className="text-gray-900 dark:text-gray-100">
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
                Mint this split record as an NFT for permanent digital receipt
                storage
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

      <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
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

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          💡 All transactions completed on Base network
        </p>
        <p className="text-xs text-muted-foreground">
          🔗 Data saved, view history anytime
        </p>
      </div>
    </div>
  );
}
