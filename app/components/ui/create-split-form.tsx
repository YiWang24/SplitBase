"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Name } from "@coinbase/onchainkit/identity";
import {
  Plus,
  ArrowRight,
  Minus,
  Users,
  DollarSign,
  Wallet,
} from "lucide-react";
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
import { CreateSplitBillInput, BASE_PAY_CONFIG, Friend } from "@/lib/types";
import { formatAmount } from "@/lib/split-utils";
import FriendSelector from "./friend-selector";

interface CreateSplitFormProps {
  onSuccess: (billId: string) => void;
  onError: (error: string) => void;
}

export default function CreateSplitForm({
  onSuccess,
  onError,
}: CreateSplitFormProps) {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<
    Omit<CreateSplitBillInput, "creatorAddress" | "creatorBasename">
  >({
    title: "",
    description: "",
    totalAmount: "",
    participantCount: 2,
  });
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [useFriendSelection, setUseFriendSelection] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateAmountPerPerson = () => {
    const total = parseFloat(formData.totalAmount);
    const count = useFriendSelection
      ? selectedFriends.length + 1
      : formData.participantCount;

    if (isNaN(total) || count < 1) return "0.00";

    return formatAmount((total / count).toString(), 6);
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

    if (useFriendSelection) {
      if (selectedFriends.length < 1) {
        errors.push("Please select at least 1 friend");
      }
      if (selectedFriends.length + 1 > BASE_PAY_CONFIG.MAX_PARTICIPANTS) {
        errors.push(
          `Cannot exceed ${BASE_PAY_CONFIG.MAX_PARTICIPANTS} participants`,
        );
      }
    } else {
      if (formData.participantCount < 2) {
        errors.push("At least 2 participants required");
      }

      if (formData.participantCount > BASE_PAY_CONFIG.MAX_PARTICIPANTS) {
        errors.push(
          `Cannot exceed ${BASE_PAY_CONFIG.MAX_PARTICIPANTS} participants`,
        );
      }
    }

    const amountPerPerson = parseFloat(calculateAmountPerPerson());
    if (amountPerPerson < parseFloat(BASE_PAY_CONFIG.MIN_AMOUNT)) {
      errors.push(
        `Amount per person ${formatAmount(amountPerPerson.toString(), 2)} USDC below minimum`,
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
        // TODO: Get user's .base domain from Basename service
        creatorBasename: undefined,
        // Include selected friends
        selectedFriends: useFriendSelection ? selectedFriends : undefined,
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
        onSuccess(result.data.id);
        // Reset form
        setFormData({
          title: "",
          description: "",
          totalAmount: "",
          participantCount: 2,
        });
        setSelectedFriends([]);
        setUseFriendSelection(false);
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

  const amountPerPerson = calculateAmountPerPerson();
  const isFormValid =
    formData.title.trim() &&
    formData.totalAmount &&
    parseFloat(formData.totalAmount) > 0 &&
    (useFriendSelection
      ? selectedFriends.length >= 1
      : formData.participantCount >= 2);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
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
          Split bills with friends using USDC on Base
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
              onChange={(e) => handleInputChange("description", e.target.value)}
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

          {/* Participant Selection Method */}
          <div
            className="space-y-4 form-section"
            style={{ animationDelay: "0.4s" }}
          >
            <Label className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
              PARTICIPANTS *
            </Label>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant={!useFriendSelection ? "default" : "outline"}
                size="sm"
                onClick={() => setUseFriendSelection(false)}
                className={`flex-1 h-12 font-bold transition-all duration-300 ${
                  !useFriendSelection
                    ? "bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 shadow-lg hover:shadow-xl hover:scale-105"
                    : "border-2 border-[#c9e265]/30 text-[#c9e265] hover:bg-[#c9e265]/10 hover:border-[#c9e265]"
                }`}
              >
                <Minus className="mr-2 h-4 w-4" />
                Manual Count
              </Button>
              <Button
                type="button"
                variant={useFriendSelection ? "default" : "outline"}
                size="sm"
                onClick={() => setUseFriendSelection(true)}
                className={`flex-1 h-12 font-bold transition-all duration-300 ${
                  useFriendSelection
                    ? "bg-gradient-to-r from-[#89d957] to-[#6bbf3a] text-neutral-900 shadow-lg hover:shadow-xl hover:scale-105"
                    : "border-2 border-[#89d957]/30 text-[#89d957] hover:bg-[#89d957]/10 hover:border-[#89d957]"
                }`}
              >
                <Users className="mr-2 h-4 w-4" />
                Select Friends
              </Button>
            </div>
          </div>

          {/* Manual Participant Count */}
          {!useFriendSelection && (
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.5s" }}
            >
              <Label
                htmlFor="participantCount"
                className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
              >
                NUMBER OF PARTICIPANTS
              </Label>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    formData.participantCount > 2 &&
                    handleInputChange(
                      "participantCount",
                      formData.participantCount - 1,
                    )
                  }
                  disabled={formData.participantCount <= 2}
                  className="h-12 w-12 p-0 border-2 border-[#c9e265]/30 text-[#c9e265] hover:bg-[#c9e265]/10 hover:border-[#c9e265] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Input
                    type="number"
                    id="participantCount"
                    value={formData.participantCount}
                    onChange={(e) =>
                      handleInputChange(
                        "participantCount",
                        parseInt(e.target.value) || 2,
                      )
                    }
                    min="2"
                    max={BASE_PAY_CONFIG.MAX_PARTICIPANTS}
                    className="w-24 h-12 text-center text-xl font-bold border-2 border-[#89d957]/30 focus:border-[#89d957] focus:ring-[#89d957]/20 transition-all duration-300 rounded-xl"
                    required
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#c9e265] to-[#89d957] rounded-full opacity-60"></div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    formData.participantCount <
                      BASE_PAY_CONFIG.MAX_PARTICIPANTS &&
                    handleInputChange(
                      "participantCount",
                      formData.participantCount + 1,
                    )
                  }
                  disabled={
                    formData.participantCount >=
                    BASE_PAY_CONFIG.MAX_PARTICIPANTS
                  }
                  className="h-12 w-12 p-0 border-2 border-[#6bbf3a]/30 text-[#6bbf3a] hover:bg-[#6bbf3a]/10 hover:border-[#6bbf3a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-neutral-500 font-medium text-center">
                Including you • Max {BASE_PAY_CONFIG.MAX_PARTICIPANTS} people
              </p>
            </div>
          )}

          {/* Friend Selection */}
          {useFriendSelection && (
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.6s" }}
            >
              <Label className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
                SELECT FRIENDS
              </Label>
              <div className="border-2 border-[#89d957]/20 rounded-xl p-4 bg-gradient-to-br from-[#89d957]/5 to-[#6bbf3a]/5">
                <FriendSelector
                  selectedFriends={selectedFriends}
                  onFriendsChange={setSelectedFriends}
                  maxParticipants={BASE_PAY_CONFIG.MAX_PARTICIPANTS}
                />
              </div>
              <p className="text-xs text-neutral-500 font-medium text-center">
                Including you • {selectedFriends.length + 1} participants
              </p>
            </div>
          )}

          {/* Amount Preview */}
          {formData.totalAmount && formData.participantCount && (
            <Card
              className="bg-gradient-to-r from-[#c9e265]/10 to-[#89d957]/10 border-2 border-[#c9e265]/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden form-section"
              style={{ animationDelay: "0.7s" }}
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="h-8 w-8 text-neutral-900" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-neutral-600 uppercase tracking-wide">
                      EACH PAYS
                    </span>
                    <div className="text-3xl font-black bg-gradient-to-r from-[#c9e265] to-[#89d957] bg-clip-text text-transparent">
                      {amountPerPerson} USDC
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Creator Info */}
          {address && (
            <Card
              className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-2 border-neutral-200/50 shadow-md form-section"
              style={{ animationDelay: "0.8s" }}
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
          <div className="form-section" style={{ animationDelay: "0.9s" }}>
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

            {!address && (
              <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl mt-4">
                <p className="text-sm text-red-700 font-bold uppercase tracking-wide">
                  🔗 CONNECT WALLET TO CREATE SPLIT
                </p>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
