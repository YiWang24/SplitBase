"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Name } from "@coinbase/onchainkit/identity";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";
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
        // TODO: 从 Basename 服务获取用户的 .base 域名
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
        // 重置表单
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
    <div className="defi-card backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-5 border-b-2 border-[var(--app-card-border)]">
        <h2 className="text-base font-semibold text-[var(--app-foreground)] flex items-center">
          <Icon name="plus" className="mr-3 text-[var(--app-accent)]" />
          CREATE SPLIT
        </h2>
        <p className="text-xs text-[var(--app-foreground-muted)] mt-2">
          Split bills with friends using USDC on Base
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Split Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-semibold text-[var(--app-foreground)] mb-3"
          >
            SPLIT TITLE *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="e.g., Dinner Split, Movie Tickets..."
            maxLength={100}
            className="w-full px-4 py-3 bg-[var(--app-card-bg)] border-2 border-[var(--app-card-border)] rounded-xl text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:border-[var(--app-accent)] defi-shadow transition-all text-xs"
            required
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-[var(--app-foreground)] mb-3"
          >
            DESCRIPTION (OPTIONAL)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Add more details..."
            rows={3}
            maxLength={200}
            className="w-full px-4 py-3 bg-[var(--app-card-bg)] border-2 border-[var(--app-card-border)] rounded-xl text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:border-[var(--app-accent)] defi-shadow transition-all text-xs resize-none"
          />
        </div>

        {/* Total Amount */}
        <div>
          <label
            htmlFor="totalAmount"
            className="block text-xs font-semibold text-[var(--app-foreground)] mb-3"
          >
            TOTAL AMOUNT (USDC) *
          </label>
          <div className="relative">
            <input
              type="number"
              id="totalAmount"
              value={formData.totalAmount}
              onChange={(e) => handleInputChange("totalAmount", e.target.value)}
              placeholder="0.00"
              min={BASE_PAY_CONFIG.MIN_AMOUNT}
              max={BASE_PAY_CONFIG.MAX_AMOUNT}
              step="0.01"
              className="w-full px-4 py-3 pr-16 bg-[var(--app-card-bg)] border-2 border-[var(--app-card-border)] rounded-xl text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:border-[var(--app-accent)] defi-shadow transition-all text-xs"
              required
            />
            <span className="absolute right-4 top-3 text-xs text-[var(--app-foreground-muted)] font-semibold">
              USDC
            </span>
          </div>
          <p className="text-xs text-[var(--app-foreground-muted)] mt-2">
            Min: {BASE_PAY_CONFIG.MIN_AMOUNT} USDC • Max:{" "}
            {BASE_PAY_CONFIG.MAX_AMOUNT} USDC
          </p>
        </div>

        {/* Participants */}
        <div>
          <label
            htmlFor="participantCount"
            className="block text-[10px] font-medium text-[var(--app-foreground)] mb-2 neon-text"
          >
            PARTICIPANTS *
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() =>
                formData.participantCount > 2 &&
                handleInputChange(
                  "participantCount",
                  formData.participantCount - 1,
                )
              }
              disabled={formData.participantCount <= 2}
              className="w-8 h-8 bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center pixel-border neon-glow text-[10px] hover:scale-110 active:scale-95 transition-all"
            >
              -
            </button>
            <input
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
              className="w-20 px-3 py-2 text-center bg-[var(--app-card-bg)] border-2 border-[var(--app-card-border)] text-[var(--app-foreground)] focus:outline-none focus:border-[var(--app-accent)] neon-glow text-[10px]"
              required
            />
            <button
              type="button"
              onClick={() =>
                formData.participantCount < BASE_PAY_CONFIG.MAX_PARTICIPANTS &&
                handleInputChange(
                  "participantCount",
                  formData.participantCount + 1,
                )
              }
              disabled={
                formData.participantCount >= BASE_PAY_CONFIG.MAX_PARTICIPANTS
              }
              className="w-8 h-8 bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center pixel-border neon-glow text-[10px] hover:scale-110 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
          <p className="text-[8px] text-[var(--app-foreground-muted)] mt-1">
            Including you • Max {BASE_PAY_CONFIG.MAX_PARTICIPANTS} people
          </p>
        </div>

        {/* Amount Preview */}
        {formData.totalAmount && formData.participantCount && (
          <div className="bg-[var(--app-accent-light)] defi-border rounded-xl p-4 defi-glow">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[var(--app-foreground)]">
                EACH PAYS
              </span>
              <span className="text-xl font-bold text-[var(--app-accent)]">
                {amountPerPerson} USDC
              </span>
            </div>
          </div>
        )}

        {/* Creator Info */}
        {address && (
          <div className="bg-[var(--app-gray)] pixel-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-[var(--app-foreground-muted)]">
                CREATOR
              </span>
              <div className="flex items-center space-x-2">
                <Name
                  address={address}
                  className="text-[8px] font-medium text-[var(--app-foreground)] neon-text"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full animate-defi-glow"
          disabled={!isFormValid || isLoading || !address}
          icon={isLoading ? undefined : <Icon name="arrow-right" size="sm" />}
        >
          {isLoading ? "CREATING..." : "CREATE SPLIT"}
        </Button>

        {!address && (
          <p className="text-center text-sm text-[var(--app-warning)] font-medium">
            CONNECT WALLET TO CREATE SPLIT
          </p>
        )}
      </form>
    </div>
  );
}
