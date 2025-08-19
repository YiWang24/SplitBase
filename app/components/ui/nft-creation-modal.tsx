"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Star, Zap, Sparkles, AlertTriangle } from "lucide-react";
import { SplitBill } from "@/lib/types";
import {
  LocationType,
  TimeOfDayType,
  LOCATION_OPTIONS,
  TIME_OPTIONS,
} from "@/lib/nft-generation";
import { generateCompleteNFT } from "@/lib/nft-compositor";
import { NFTGenerationParams } from "@/lib/nft-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNFTErrorHandler } from "./nft-error-boundary";
import { NFTGenerationProgress } from "./nft-loading";
import { useAccount } from "wagmi";
import "./nft-creation-modal.css";

interface NFTCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: SplitBill;
  onNFTCreated: (nftId: string) => void;
}

export default function NFTCreationModal({
  isOpen,
  onClose,
  bill,
  onNFTCreated,
}: NFTCreationModalProps) {
  const { address } = useAccount();
  const [location, setLocation] = useState<LocationType>("ramen");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayType>("night");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const { error, handleError, clearError } = useNFTErrorHandler();

  // Function to calculate dynamic height
  const calculateCanvasHeight = useCallback((participantCount: number) => {
    // Base height: scene(140) + title area(60) + amount area(40) + bottom footer(40) = 280
    const baseHeight = 280;

    // Avatar area height: max 4 avatars per row, each avatar height(48) + spacing(60) + text area(50)
    const avatarsPerRow = Math.min(participantCount, 4);
    const rows = Math.ceil(participantCount / avatarsPerRow);
    const avatarSectionHeight = rows * (48 + 60 + 50);

    // Participants info text area
    const participantsInfoHeight = 50;

    // Total height = base height + avatar area height + participants info height + extra spacing
    return baseHeight + avatarSectionHeight + participantsInfoHeight + 20;
  }, []);

  // Common parameters for generating preview and final NFT
  const getNFTGenerationOptions = useCallback(
    (participantCount: number, isPreview: boolean = false) => {
      const height = calculateCanvasHeight(participantCount);

      return {
        canvasWidth: isPreview ? 300 : 300, // Small size for preview, large size for final
        canvasHeight: height,
        avatarSize: isPreview ? 48 : 48, // Small avatars for preview, large avatars for final
        includeMetadata: false, // Keep consistent with HTML layout
      };
    },
    [calculateCanvasHeight],
  );

  // Generate preview when options change
  const generatePreview = useCallback(async () => {
    if (!isOpen) return;

    try {
      clearError();
      setIsGenerating(true);

      const params: NFTGenerationParams = {
        participants: bill.participants
          .map((p) => p.displayName)
          .filter(Boolean) as string[],
        location,
        timeOfDay,
        totalAmount: Number(bill.totalAmount),
        billId: bill.id || "",
        billTitle: bill.title,
      };

      const options = getNFTGenerationOptions(bill.participantCount, true);
      const imageData = await generateCompleteNFT(params, options);

      setPreviewImage(imageData);
    } catch (err) {
      handleError(err, "preview generation");
    } finally {
      setIsGenerating(false);
    }
  }, [
    isOpen,
    bill,
    location,
    timeOfDay,
    clearError,
    handleError,
    getNFTGenerationOptions,
  ]);

  // Generate preview on mount and option changes
  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
  }, [generatePreview, isOpen]);

  const handleCreateNFT = async () => {
    setIsCreating(true);
    clearError();
    setGenerationStep(0);

    try {
      const params: NFTGenerationParams = {
        participants: bill.participants
          .map((p) => p.displayName)
          .filter(Boolean) as string[],
        location,
        timeOfDay,
        totalAmount: Number(bill.totalAmount),
        billId: bill.id || "",
        billTitle: bill.title,
      };

      // Step 1: Preparing canvas
      setGenerationStep(1);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: Generate full-size NFT with same parameters as preview
      setGenerationStep(2);
      const options = getNFTGenerationOptions(bill.participantCount, false);
      const imageData = await generateCompleteNFT(params, options);

      // Step 3: Storing NFT
      setGenerationStep(3);
      const response = await fetch("/api/nft/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          params,
          imageData,
          userId: address, // Include user address for NFT ownership
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Step 4: Complete
        setGenerationStep(4);
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("NFT creation completed successfully:", result);
        console.log("NFT ID:", result.nftId);
        console.log("Calling onNFTCreated callback...");

        // Update local bill state to include NFT information in the participant
        if (bill && address) {
          // Update the participant's nftReceiptId
          const participantIndex = bill.participants.findIndex(
            (participant) =>
              participant.address?.toLowerCase() === address?.toLowerCase(),
          );

          if (participantIndex !== -1) {
            bill.participants[participantIndex] = {
              ...bill.participants[participantIndex],
              nftReceiptId: result.nftId,
            };
          }

          bill.updatedAt = new Date();
        }

        onNFTCreated(result.nftId);
        onClose();
      } else {
        throw new Error(result.error || "Failed to create NFT");
      }
    } catch (err) {
      handleError(err, "NFT creation");
    } finally {
      setIsCreating(false);
      setGenerationStep(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[98vh] sm:max-h-[95vh] overflow-y-auto bg-white shadow-brand-xl border-2 border-brand-primary nft-modal-mobile sm:nft-modal-tablet lg:nft-modal-desktop nft-modal-scroll z-[10000]">
        {/* Header */}
        <div className="sticky top-0 bg-brand-gradient p-3 sm:p-4 text-white z-10 nft-modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold truncate">
                  Create NFT Receipt
                </h2>
                <p className="text-xs sm:text-sm opacity-90 truncate">
                  Mint your split as a digital collectible
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6 nft-modal-content pb-16">
          {/* Bill Info */}
          <div className="bg-neutral-50 rounded-xl p-3 sm:p-4 border border-neutral-200 nft-section">
            <h3 className="font-semibold text-neutral-700 mb-2 text-sm sm:text-base">
              {bill.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-neutral-500">Total Amount:</span>
                <span className="ml-2 font-semibold text-brand-accent">
                  {bill.totalAmount} USDC
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Participants:</span>
                <span className="ml-2 font-semibold text-brand-accent">
                  {bill.participantCount}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-neutral-500 text-xs sm:text-sm">
                Participants:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {bill.participants.map((participant, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-1 nft-participant-badge"
                  >
                    {participant.displayName}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Customization Options */}
          <div className="space-y-4 nft-section">
            <h3 className="font-semibold text-neutral-700 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-brand-primary" />
              Customize Your NFT
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">
                  Location Scene
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as LocationType)}
                  className="w-full p-3 border border-neutral-200 rounded-lg bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all nft-form-select"
                >
                  {LOCATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Cycle Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">
                  Time Cycle
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) =>
                    setTimeOfDay(e.target.value as TimeOfDayType)
                  }
                  className="w-full p-3 border border-neutral-200 rounded-lg bg-white focus:border-brand-primary focus:ring-2 focus:ring-primary/20 transition-all nft-form-select"
                >
                  {TIME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-3 sm:space-y-4 nft-section">
            <h3 className="font-semibold text-neutral-700 flex items-center text-sm sm:text-base">
              <Zap className="w-4 h-4 mr-2 text-brand-primary flex-shrink-0" />
              NFT Preview
            </h3>

            <div className="flex justify-center w-full">
              <div className="relative nft-preview-container w-full max-w-sm sm:max-w-md">
                {previewImage && !isGenerating ? (
                  <img
                    src={previewImage}
                    alt="NFT Preview"
                    className="w-full h-full rounded-xl border-2 border-brand-primary shadow-brand-lg"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-neutral-100 rounded-xl border-2 border-neutral-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm sm:text-base text-neutral-500 px-4">
                        {isGenerating
                          ? "Generating preview..."
                          : "Loading preview..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generation Progress */}
          {isCreating && (
            <div className="bg-white border border-brand-primary/30 rounded-lg p-4 sm:p-6 nft-progress-container">
              <NFTGenerationProgress
                step={generationStep}
                totalSteps={4}
                currentStepMessage={
                  generationStep === 1
                    ? "Preparing canvas..."
                    : generationStep === 2
                      ? "Generating avatars and scene..."
                      : generationStep === 3
                        ? "Storing NFT..."
                        : generationStep === 4
                          ? "Complete!"
                          : "Starting..."
                }
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-error-light border border-error-main/30 rounded-lg p-3 sm:p-4 nft-error-container">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-error-main flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-error-dark text-xs sm:text-sm font-medium mb-1">
                    Error Creating NFT
                  </p>
                  <p className="text-error-dark/80 text-xs sm:text-sm break-words">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-row gap-3 pt-6 pb-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 sm:h-12 nft-action-button text-base font-semibold"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNFT}
              disabled={isCreating || !previewImage}
              className="flex-1 h-14 sm:h-12 bg-brand-gradient hover:bg-brand-gradient-dark text-white font-semibold shadow-brand transition-all duration-200 hover:shadow-brand-lg nft-action-button text-base"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-base">Creating NFT...</span>
                </>
              ) : (
                <>
                  <Star className="w-5 h-5 mr-2" />
                  <span className="text-base">Create NFT Receipt</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
