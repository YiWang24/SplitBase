"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { SplitBill } from "@/lib/types";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Receipt,
  Plus,
  Wallet as WalletIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletNotConnected from "@/app/components/ui/wallet-not-connected";
// import { Skeleton } from "@/components/ui/skeleton";

interface BillsData {
  createdBills: SplitBill[];
  receivedBills: SplitBill[];
}

export default function BillsContent() {
  const { address, isConnected } = useAccount();
  const [billsData, setBillsData] = useState<BillsData>({
    createdBills: [],
    receivedBills: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "created" | "received" | "receipts"
  >("created");

  const fetchUserBills = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch bills created by user
      const createdResponse = await fetch(`/api/bills/user/${address}`);
      const createdBills = createdResponse.ok
        ? await createdResponse.json()
        : [];

      // Fetch bills where user is a participant
      const receivedResponse = await fetch(`/api/bills/participant/${address}`);
      const receivedBills = receivedResponse.ok
        ? await receivedResponse.json()
        : [];

      setBillsData({
        createdBills,
        receivedBills,
      });
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserBills();
    }
  }, [isConnected, address, fetchUserBills]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "outline"; // neutral outline for active
      case "completed":
        return "secondary"; // green-ish secondary
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100";
      case "completed":
        return "bg-green-50 border-green-300 text-green-700 hover:bg-green-100";
      case "cancelled":
        return "bg-red-50 border-red-300 text-red-700 hover:bg-red-100";
      default:
        return "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100";
    }
  };

  const BillCard = ({
    bill,
    type,
  }: {
    bill: SplitBill;
    type: "created" | "received";
  }) => {
    const getBorderStyle = (type: "created" | "received") => {
      switch (type) {
        case "created":
          return "border-2 border-[var(--brand-primary)]/40 hover:border-[var(--brand-primary)]/60";
        case "received":
          return "border-2 border-[var(--brand-secondary)]/40 hover:border-[var(--brand-secondary)]/60";
        default:
          return "border-2 border-white/50";
      }
    };

    return (
      <Link href={`/split/${bill.id}`}>
        <Card
          className={`hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in cursor-pointer bg-white/95 backdrop-blur-sm shadow-lg ${getBorderStyle(type)}`}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-sm font-bold tracking-wide text-neutral-900">
                  {bill.title.toUpperCase()}
                </CardTitle>
                {bill.description && (
                  <CardDescription className="text-xs mt-1 text-neutral-600">
                    {bill.description}
                  </CardDescription>
                )}
              </div>
              <Badge
                variant={getStatusVariant(bill.status)}
                className={`text-[10px] tracking-wide px-2 py-0.5 rounded-full border-2 ${getStatusStyles(bill.status)} shadow-sm`}
              >
                {bill.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-brand-primary" />
                  <span className="font-medium text-neutral-900">
                    ${Number(bill.totalAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-brand-secondary" />
                  <span className="text-neutral-800">
                    {bill.participants.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-500" />
                <span className="text-neutral-700">
                  {formatDate(bill.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-600 bg-neutral-100/50 px-2 py-1 rounded-md">
                Creator: {bill.creatorAddress.slice(0, 6)}...
                {bill.creatorAddress.slice(-4)}
              </div>
              {bill.status === "completed" ? (
                <CheckCircle className="w-4 h-4 text-brand-secondary" />
              ) : (
                <Clock className="w-4 h-4 text-brand-primary" />
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const ReceiptItem = ({ bill }: { bill: SplitBill }) => (
    <Link href={`/receipts/${bill.id}`}>
      <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in cursor-pointer bg-gradient-to-br from-white/95 to-[var(--brand-accent)]/10 backdrop-blur-sm border-2 border-[var(--brand-accent)]/40 shadow-lg hover:border-[var(--brand-accent)]/60">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-sm font-bold tracking-wide text-neutral-900">
                {bill.title.toUpperCase()}
              </CardTitle>
              {bill.description && (
                <CardDescription className="text-xs mt-1 text-neutral-600">
                  {bill.description}
                </CardDescription>
              )}
            </div>
            <Badge
              variant="secondary"
              className="text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-gradient-to-r from-[var(--brand-accent)]/20 to-[var(--brand-accent)]/30 border-2 border-[var(--brand-accent)] text-[var(--brand-accent)] shadow-sm hover:from-[var(--brand-accent)]/30 hover:to-[var(--brand-accent)]/40"
            >
              RECEIPT
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-brand-primary" />
                <span className="font-medium text-neutral-900">
                  ${Number(bill.totalAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-brand-secondary" />
                <span className="text-neutral-800">
                  {bill.participants.length}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-neutral-500" />
              <span className="text-neutral-700">
                {formatDate(bill.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-600 bg-[var(--brand-accent)]/10 px-2 py-1 rounded-md border border-[var(--brand-accent)]/20">
              Creator: {bill.creatorAddress.slice(0, 6)}...
              {bill.creatorAddress.slice(-4)}
            </div>
            <CheckCircle className="w-4 h-4 text-[var(--brand-accent)]" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card
          key={i}
          className="bg-white/90 backdrop-blur-sm border-2 border-white/50 shadow-lg animate-pulse"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 rounded-full w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-[var(--brand-secondary)]/20 to-[var(--brand-accent)]/20 rounded-full w-1/2"></div>
              </div>
              <div className="h-5 w-16 bg-gradient-to-r from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-3 bg-gradient-to-r from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 rounded-full w-1/4"></div>
                <div className="h-3 bg-gradient-to-r from-[var(--brand-secondary)]/20 to-[var(--brand-accent)]/20 rounded-full w-1/6"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gradient-to-r from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 rounded-full w-1/3"></div>
                <div className="h-4 w-4 bg-gradient-to-r from-[var(--brand-secondary)]/20 to-[var(--brand-accent)]/20 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20">
        <div className="flex items-center justify-center min-h-screen p-4">
          <WalletNotConnected
            icon={WalletIcon}
            title="CONNECT WALLET"
            description="Please connect your wallet to view your bills"
            className="max-w-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-20">
      {/* Header Section */}
      <div className="mb-4 text-center">
        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-xl flex items-center justify-center shadow-lg mb-3">
          <Receipt className="h-6 w-6 text-neutral-900" />
        </div>
        <h1 className="text-xl font-black text-neutral-900 tracking-wide mb-1">
          MY BILLS
        </h1>
        <p className="text-xs text-neutral-600 font-medium max-w-md mx-auto">
          Manage your split bills
        </p>

        {/* Stats Badges */}
        <div className="flex gap-2 flex-wrap justify-center mt-3">
          <div className="text-center">
            <Badge
              variant="outline"
              className="border-[#c9e265]/30 text-[#c9e265] bg-white/80 whitespace-nowrap mb-1"
            >
              $
              {billsData.createdBills
                .reduce((sum, bill) => sum + Number(bill.totalAmount), 0)
                .toFixed(2)}
            </Badge>
            <div className="text-xs text-neutral-600">Created</div>
          </div>

          <div className="text-center">
            <Badge
              variant="outline"
              className="border-[#89d957]/30 text-[#89d957] bg-white/80 whitespace-nowrap mb-1"
            >
              $
              {billsData.receivedBills
                .reduce((sum, bill) => sum + Number(bill.totalAmount), 0)
                .toFixed(2)}
            </Badge>
            <div className="text-xs text-neutral-600">Received</div>
          </div>

          <div className="text-center">
            <Badge
              variant="outline"
              className="border-[#c9e265]/50 text-[#c9e265] bg-white/80 whitespace-nowrap mb-1"
            >
              {(() => {
                const totalBills =
                  billsData.createdBills.length +
                  billsData.receivedBills.length;
                const completedBills =
                  billsData.createdBills.filter((b) => b.status === "completed")
                    .length +
                  billsData.receivedBills.filter(
                    (b) => b.status === "completed",
                  ).length;
                return totalBills > 0
                  ? `${Math.round((completedBills / totalBills) * 100)}%`
                  : "0%";
              })()}
            </Badge>
            <div className="text-xs text-neutral-nowrap">Complete</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4 w-full overflow-x-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "created" | "received" | "receipts")
          }
        >
          <TabsList className="grid w-full grid-cols-3 bg-white/90 border brand-border rounded-xl p-1 gap-1 shadow-lg">
            <TabsTrigger
              value="created"
              className="text-[10px] font-bold tracking-wider text-neutral-800 bg-white/80 hover:bg-[var(--brand-primary)]/20 border border-transparent rounded-lg data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-neutral-900 data-[state=active]:border-[var(--brand-primary)] data-[state=active]:shadow-md"
            >
              CREATED ({billsData.createdBills.length})
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="text-[10px] font-bold tracking-wider text-neutral-800 bg-white/80 hover:bg-[var(--brand-primary)]/20 border border-transparent rounded-lg data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-neutral-900 data-[state=active]:border-[var(--brand-primary)] data-[state=active]:shadow-md"
            >
              RECEIVED ({billsData.receivedBills.length})
            </TabsTrigger>
            <TabsTrigger
              value="receipts"
              className="text-[10px] font-bold tracking-wider text-neutral-800 bg-white/80 hover:bg-[var(--brand-primary)]/20 border border-transparent rounded-lg data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-neutral-900 data-[state=active]:border-[var(--brand-primary)] data-[state=active]:shadow-md"
            >
              RECEIPTS (
              {billsData.createdBills.filter((b) => b.status === "completed")
                .length +
                billsData.receivedBills.filter((b) => b.status === "completed")
                  .length}
              )
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <TabsContent value="created" className="space-y-4">
                  {billsData.createdBills.length > 0 ? (
                    billsData.createdBills.map((bill, index) => (
                      <div
                        key={bill.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <BillCard bill={bill} type="created" />
                      </div>
                    ))
                  ) : (
                    <Card className="text-center p-8 bg-white/90 backdrop-blur-sm border-2 border-[var(--brand-primary)]/20 shadow-lg">
                      <CardContent className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 rounded-full flex items-center justify-center border-2 border-[var(--brand-primary)]/30">
                          <Receipt className="w-8 h-8 text-[var(--brand-primary)]" />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-sm font-bold tracking-wider text-neutral-900">
                            NO BILLS CREATED
                          </CardTitle>
                          <CardDescription className="text-xs text-neutral-600">
                            You haven&apos;t created any split bills yet
                          </CardDescription>
                        </div>
                        <Link href="/create">
                          <Button className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:from-[var(--brand-primary-dark)] hover:to-[var(--brand-secondary-dark)] text-neutral-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Plus className="w-4 h-4 mr-2" />
                            CREATE FIRST BILL
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="received" className="space-y-4">
                  {billsData.receivedBills.length > 0 ? (
                    billsData.receivedBills.map((bill, index) => (
                      <div
                        key={bill.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <BillCard bill={bill} type="received" />
                      </div>
                    ))
                  ) : (
                    <Card className="text-center p-8 bg-white/90 backdrop-blur-sm border-2 border-[var(--brand-secondary)]/20 shadow-lg">
                      <CardContent className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[var(--brand-secondary)]/20 to-[var(--brand-accent)]/20 rounded-full flex items-center justify-center border-2 border-[var(--brand-secondary)]/30">
                          <Receipt className="w-8 h-8 text-[var(--brand-secondary)]" />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-sm font-bold tracking-wider text-neutral-900">
                            NO BILLS RECEIVED
                          </CardTitle>
                          <CardDescription className="text-xs text-neutral-600">
                            You haven&apos;t received any split bills yet
                          </CardDescription>
                        </div>
                        <div className="text-xs text-neutral-500 bg-neutral-100/50 px-3 py-2 rounded-md border border-neutral-200/50">
                          💡 Share this app with friends to start receiving
                          split requests
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="receipts" className="space-y-4">
                  {(() => {
                    const completed = [
                      ...billsData.createdBills,
                      ...billsData.receivedBills,
                    ].filter((b) => b.status === "completed");
                    return completed.length > 0 ? (
                      completed.map((bill, index) => (
                        <div
                          key={bill.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <ReceiptItem bill={bill} />
                        </div>
                      ))
                    ) : (
                      <Card className="text-center p-8 bg-gradient-to-br from-white/90 to-[var(--brand-secondary)]/10 backdrop-blur-sm border-2 border-[var(--brand-secondary)]/30 shadow-lg">
                        <CardContent className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[var(--brand-secondary)]/20 to-[var(--brand-accent)]/20 rounded-full flex items-center justify-center border-2 border-[var(--brand-secondary)]/30">
                            <Receipt className="w-8 h-8 text-[var(--brand-secondary)]" />
                          </div>
                          <div className="space-y-2">
                            <CardTitle className="text-sm font-bold tracking-wider text-neutral-900">
                              NO RECEIPTS YET
                            </CardTitle>
                            <CardDescription className="text-xs text-neutral-600">
                              Complete a bill to see receipts here
                            </CardDescription>
                          </div>
                          <div className="text-xs text-neutral-600 bg-[var(--brand-secondary)]/10 px-3 py-2 rounded-md border border-[var(--brand-secondary)]/20">
                            🎯 Receipts will appear here once you complete your
                            first split
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
