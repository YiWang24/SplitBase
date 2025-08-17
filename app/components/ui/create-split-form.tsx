"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Name } from "@coinbase/onchainkit/identity";
import { Plus, ArrowRight, Minus } from "lucide-react";
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
import { formatAmount } from "@/lib/split-utils";

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
    const count = formData.participantCount;

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

    if (formData.participantCount < 2) {
      errors.push("At least 2 participants required");
    }

    if (formData.participantCount > BASE_PAY_CONFIG.MAX_PARTICIPANTS) {
      errors.push(
        `Cannot exceed ${BASE_PAY_CONFIG.MAX_PARTICIPANTS} participants`,
      );
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
    formData.participantCount >= 2;

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Card className="backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          CREATE SPLIT
        </CardTitle>
        <CardDescription>
          Split bills with friends using USDC on Base
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Split Title */}
          <div className="space-y-2">
            <Label htmlFor="title">SPLIT TITLE *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Dinner Split, Movie Tickets..."
              maxLength={100}
              required
            />
          </div>

          {/* Description (optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">DESCRIPTION (OPTIONAL)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Add more details..."
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount">TOTAL AMOUNT (USDC) *</Label>
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
                className="pr-16"
                required
              />
              <Badge
                variant="secondary"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                USDC
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Min: {BASE_PAY_CONFIG.MIN_AMOUNT} USDC • Max:{" "}
              {BASE_PAY_CONFIG.MAX_AMOUNT} USDC
            </p>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label htmlFor="participantCount">PARTICIPANTS *</Label>
            <div className="flex items-center space-x-3">
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
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
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
                className="w-20 text-center"
                required
              />
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
                  formData.participantCount >= BASE_PAY_CONFIG.MAX_PARTICIPANTS
                }
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Including you • Max {BASE_PAY_CONFIG.MAX_PARTICIPANTS} people
            </p>
          </div>

          {/* Amount Preview */}
          {formData.totalAmount && formData.participantCount && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">EACH PAYS</span>
                  <span className="text-xl font-bold text-primary">
                    {amountPerPerson} USDC
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Creator Info */}
          {address && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">CREATOR</span>
                  <div className="flex items-center space-x-2">
                    <Name address={address} className="text-xs font-medium" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isFormValid || isLoading || !address}
          >
            {isLoading ? (
              "CREATING..."
            ) : (
              <>
                CREATE SPLIT
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {!address && (
            <p className="text-center text-sm text-destructive font-medium">
              CONNECT WALLET TO CREATE SPLIT
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
