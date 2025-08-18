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
import { Skeleton } from "@/components/ui/skeleton";

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
  const [activeTab, setActiveTab] = useState<"created" | "received">("created");

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
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const BillCard = ({ bill }: { bill: SplitBill }) => (
    <Link href={`/split/${bill.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-sm font-bold tracking-wide">
                {bill.title.toUpperCase()}
              </CardTitle>
              {bill.description && (
                <CardDescription className="text-xs mt-1">
                  {bill.description}
                </CardDescription>
              )}
            </div>
            <Badge variant={getStatusVariant(bill.status)} className="text-xs">
              {bill.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium text-primary">
                  ${Number(bill.totalAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{bill.participants.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(bill.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Creator: {bill.creatorAddress.slice(0, 6)}...
              {bill.creatorAddress.slice(-4)}
            </div>
            {bill.status === "completed" ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/6" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-4 rounded-full" />
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
          <Card className="text-center p-8 max-w-sm w-full">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <WalletIcon className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <CardTitle className="text-lg font-bold tracking-wider">
                  CONNECT WALLET
                </CardTitle>
                <CardDescription>
                  Please connect your wallet to view your bills
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 w-full overflow-x-hidden pt-4">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-lg font-bold tracking-wider">
            MY BILLS
          </CardTitle>
          <CardDescription>Manage your split bills</CardDescription>
        </CardHeader>
      </Card>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4 w-full overflow-x-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "created" | "received")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="created" className="text-xs">
              CREATED ({billsData.createdBills.length})
            </TabsTrigger>
            <TabsTrigger value="received" className="text-xs">
              RECEIVED ({billsData.receivedBills.length})
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
                        <BillCard bill={bill} />
                      </div>
                    ))
                  ) : (
                    <Card className="text-center p-8">
                      <CardContent className="space-y-4">
                        <Receipt className="w-12 h-12 mx-auto text-muted-foreground" />
                        <div className="space-y-2">
                          <CardTitle className="text-sm font-bold tracking-wide">
                            NO BILLS CREATED
                          </CardTitle>
                          <CardDescription className="text-xs">
                            You haven&apos;t created any split bills yet
                          </CardDescription>
                        </div>
                        <Link href="/create">
                          <Button>
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
                        <BillCard bill={bill} />
                      </div>
                    ))
                  ) : (
                    <Card className="text-center p-8">
                      <CardContent className="space-y-4">
                        <Receipt className="w-12 h-12 mx-auto text-muted-foreground" />
                        <div className="space-y-2">
                          <CardTitle className="text-sm font-bold tracking-wide">
                            NO BILLS RECEIVED
                          </CardTitle>
                          <CardDescription className="text-xs">
                            You haven&apos;t received any split bills yet
                          </CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
