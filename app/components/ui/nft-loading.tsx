"use client";

import { Star, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NFTLoadingProps {
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "spinner" | "pulse" | "shimmer";
}

export default function NFTLoading({
  message = "Loading...",
  size = "medium",
  variant = "spinner",
}: NFTLoadingProps) {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const containerClasses = {
    small: "p-4",
    medium: "p-6",
    large: "p-8",
  };

  if (variant === "spinner") {
    return (
      <div
        className={`flex flex-col items-center justify-center ${containerClasses[size]}`}
      >
        <div className="relative">
          <div
            className={`${sizeClasses[size]} border-4 border-neutral-200 rounded-full animate-spin`}
          ></div>
          <div
            className={`absolute top-0 left-0 ${sizeClasses[size]} border-4 border-brand-primary border-t-transparent rounded-full animate-spin`}
          ></div>
        </div>
        {message && (
          <p className="text-neutral-600 text-sm mt-3 text-center">{message}</p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={`flex flex-col items-center justify-center ${containerClasses[size]}`}
      >
        <div className="relative">
          <Star
            className={`${sizeClasses[size]} text-brand-primary animate-pulse`}
          />
          <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping"></div>
        </div>
        {message && (
          <p className="text-neutral-600 text-sm mt-3 text-center">{message}</p>
        )}
      </div>
    );
  }

  if (variant === "shimmer") {
    return (
      <div
        className={`flex flex-col items-center justify-center ${containerClasses[size]}`}
      >
        <div className="flex space-x-2">
          <Sparkles
            className={`${sizeClasses[size]} text-brand-primary animate-bounce`}
            style={{ animationDelay: "0ms" }}
          />
          <Zap
            className={`${sizeClasses[size]} text-brand-secondary animate-bounce`}
            style={{ animationDelay: "150ms" }}
          />
          <Star
            className={`${sizeClasses[size]} text-brand-accent animate-bounce`}
            style={{ animationDelay: "300ms" }}
          />
        </div>
        {message && (
          <p className="text-neutral-600 text-sm mt-3 text-center">{message}</p>
        )}
      </div>
    );
  }

  return null;
}

// NFT Card Loading Skeleton
export function NFTCardSkeleton() {
  return (
    <Card className="w-64 h-80 border-2 border-neutral-200 overflow-hidden">
      <div className="h-2/3 bg-neutral-100 animate-pulse relative">
        <div className="absolute top-2 right-2 w-16 h-6 bg-neutral-200 rounded animate-pulse"></div>
      </div>
      <CardContent className="p-4 h-1/3 space-y-3">
        <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-3 bg-neutral-100 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2"></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 bg-neutral-100 rounded animate-pulse"></div>
          <div className="h-3 bg-neutral-100 rounded animate-pulse"></div>
        </div>
        <div className="h-3 bg-neutral-100 rounded animate-pulse w-2/3"></div>
      </CardContent>
    </Card>
  );
}

// NFT Gallery Loading Grid
export function NFTGalleryLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <NFTCardSkeleton key={index} />
      ))}
    </div>
  );
}

// NFT Generation Progress
export function NFTGenerationProgress({
  step,
  totalSteps = 4,
  currentStepMessage = "Generating NFT...",
}: {
  step: number;
  totalSteps?: number;
  currentStepMessage?: string;
}) {
  const progress = (step / totalSteps) * 100;

  const steps = [
    "Preparing canvas...",
    "Generating avatars...",
    "Creating scene...",
    "Finalizing NFT...",
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          Creating Your NFT
        </h3>
        <p className="text-neutral-500 text-sm">{currentStepMessage}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-brand-gradient h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between text-xs text-neutral-500">
        {steps.map((stepText, index) => (
          <div
            key={index}
            className={`flex items-center space-x-1 ${
              index < step
                ? "text-brand-primary"
                : index === step
                  ? "text-neutral-700 font-medium"
                  : "text-neutral-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                index < step
                  ? "bg-brand-primary"
                  : index === step
                    ? "bg-brand-secondary animate-pulse"
                    : "bg-neutral-300"
              }`}
            ></div>
            <span className="hidden sm:inline">{stepText}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
