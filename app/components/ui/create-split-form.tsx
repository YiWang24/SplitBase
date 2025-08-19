"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Name, useName } from "@coinbase/onchainkit/identity";
import { base } from "viem/chains";
import { Plus, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreateSplitBillInput, BASE_PAY_CONFIG } from "@/lib/types";
import ShareModal from "./share-modal";

interface CreateSplitFormProps {
  onSuccess: (billId: string) => void;
  onError: (error: string) => void;
}

export default function CreateSplitForm({
  onSuccess,
  onError,
}: CreateSplitFormProps) {
  const { address } = useAccount();
  const { data: basename } = useName({
    address: address!,
    chain: base,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<
    Omit<CreateSplitBillInput, "creatorAddress" | "creatorBasename">
  >({
    title: "",
    description: "",
    totalAmount: "",
  });

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdBillData, setCreatedBillData] = useState<{
    id: string;
    title: string;
    amount: string;
    shareUrl: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Please enter split title");
    }

    const totalAmount = parseFloat(formData.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      errors.push("Please enter valid total amount");
    }

    if (totalAmount < parseFloat(BASE_PAY_CONFIG.MIN_AMOUNT)) {
      errors.push(
        `Total amount cannot be less than ${BASE_PAY_CONFIG.MIN_AMOUNT} USDC`,
      );
    }

    if (totalAmount > parseFloat(BASE_PAY_CONFIG.MAX_AMOUNT)) {
      errors.push(
        `Total amount cannot exceed ${BASE_PAY_CONFIG.MAX_AMOUNT} USDC`,
      );
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      onError("Please connect wallet first");
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      onError(errors.join(", "));
      return;
    }

    setIsLoading(true);

    try {
      const createData: CreateSplitBillInput = {
        ...formData,
        creatorAddress: address,
        creatorBasename: basename ? String(basename) : undefined,
      };

      const response = await fetch("/api/split/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Set created bill data for share modal
        const shareUrl = `${window.location.origin}/split/${result.data.id}`;
        setCreatedBillData({
          id: result.data.id,
          title: formData.title,
          amount: formData.totalAmount,
          shareUrl,
        });

        // Show share modal
        setShowShareModal(true);

        // Reset form
        setFormData({
          title: "",
          description: "",
          totalAmount: "",
        });

        // Call success callback
        onSuccess(result.data.id);
      } else {
        onError(result.error || "Failed to create split");
      }
    } catch (error) {
      console.error("Error creating split bill:", error);
      onError("Network error, please retry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
    setCreatedBillData(null);
  };

  const isFormValid =
    formData.title.trim() &&
    formData.totalAmount &&
    parseFloat(formData.totalAmount) > 0;

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Card className="backdrop-blur-sm border-0 bg-gradient-to-br from-white/95 to-[#c9e265]/5 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Enhanced Card Header */}
        <CardHeader className="bg-gradient-to-r from-[#c9e265]/10 to-[#89d957]/10 border-b border-[#c9e265]/20 pb-6">
          <CardTitle className="flex items-center gap-3 text-xl font-black tracking-wide">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="h-5 w-5 text-neutral-900" />
            </div>
            <span className="bg-gradient-to-r from-[#c9e265] to-[#89d957] bg-clip-text text-transparent">
              CREATE SPLIT
            </span>
          </CardTitle>
          <CardDescription className="text-neutral-600 font-medium">
            Create a split bill and share with friends
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Split Title */}
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.1s" }}
            >
              <Label
                htmlFor="title"
                className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
              >
                SPLIT TITLE *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Dinner Split, Movie Tickets..."
                maxLength={100}
                required
                className="h-12 border-2 border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl text-lg font-medium placeholder:text-neutral-400 form-input-enhanced"
              />
            </div>

            {/* Description (optional) */}
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.2s" }}
            >
              <Label
                htmlFor="description"
                className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
              >
                DESCRIPTION (OPTIONAL)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Add more details..."
                rows={3}
                maxLength={200}
                className="border-2 border-[#89d957]/20 focus:border-[#89d957] focus:ring-[#89d957]/20 transition-all duration-300 rounded-xl text-base placeholder:text-neutral-400 resize-none form-input-enhanced"
              />
            </div>

            {/* Total Amount */}
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.3s" }}
            >
              <Label
                htmlFor="totalAmount"
                className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
              >
                TOTAL AMOUNT (USDC) *
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="totalAmount"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    handleInputChange("totalAmount", e.target.value)
                  }
                  placeholder="0.00"
                  min={BASE_PAY_CONFIG.MIN_AMOUNT}
                  max={BASE_PAY_CONFIG.MAX_AMOUNT}
                  step="0.01"
                  className="h-12 pr-20 border-2 border-[#6bbf3a]/20 focus:border-[#6bbf3a] focus:ring-[#6bbf3a]/20 transition-all duration-300 rounded-xl text-lg font-bold placeholder:text-neutral-400 form-input-enhanced"
                  required
                />
                <Badge
                  variant="secondary"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#6bbf3a] to-[#b8d14a] text-white border-0 px-3 py-1 font-bold text-xs"
                >
                  USDC
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                Min: {BASE_PAY_CONFIG.MIN_AMOUNT} USDC • Max:{" "}
                {BASE_PAY_CONFIG.MAX_AMOUNT} USDC
              </p>
            </div>

            {/* Creator Info */}
            {address && (
              <Card
                className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-2 border-neutral-200/50 shadow-md form-section"
                style={{ animationDelay: "0.4s" }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                      CREATOR
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-full flex items-center justify-center">
                        <Wallet className="h-3 w-3 text-neutral-900" />
                      </div>
                      <Name
                        address={address}
                        className="text-xs font-bold text-neutral-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="bg-gradient-to-r from-transparent via-[#c9e265]/30 to-transparent" />

            {/* Submit Button */}
            <div className="form-section" style={{ animationDelay: "0.5s" }}>
              <Button
                type="submit"
                size="lg"
                className={`w-full h-14 font-black text-lg tracking-wide transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                  isFormValid && address
                    ? "bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 shadow-lg hover:shadow-xl hover:shadow-[#c9e265]/30"
                    : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                }`}
                disabled={!isFormValid || isLoading || !address}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
                    CREATING...
                  </div>
                ) : (
                  <>
                    CREATE SPLIT
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Wallet Connection Reminder */}
      {!address && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3 text-amber-800">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
              <Wallet className="h-3 w-3 text-white" />
            </div>
            <p className="text-sm font-medium">
              Connect your wallet to create a split bill
            </p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {createdBillData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={handleShareModalClose}
          shareUrl={createdBillData.shareUrl}
          billTitle={createdBillData.title}
          amount={createdBillData.amount}
        />
      )}
    </>
  );
}
