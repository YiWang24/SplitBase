"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NFTErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface NFTErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class NFTErrorBoundary extends React.Component<
  NFTErrorBoundaryProps,
  NFTErrorBoundaryState
> {
  constructor(props: NFTErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): NFTErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("NFT Error Boundary caught an error:", error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent error={this.state.error} retry={this.retry} />
        );
      }

      return (
        <DefaultNFTErrorFallback error={this.state.error} retry={this.retry} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  retry: () => void;
}

function DefaultNFTErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <Card className="bg-error-light border-error-main/30 max-w-md mx-auto">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-error-main/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-error-main" />
        </div>
        <h3 className="text-lg font-semibold text-error-dark mb-2">
          NFT Error
        </h3>
        <p className="text-error-dark/80 text-sm mb-4">
          {error?.message ||
            "Something went wrong with the NFT system. Please try again."}
        </p>
        <Button
          onClick={retry}
          className="bg-brand-gradient hover:bg-brand-gradient-dark text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

// Hook for handling NFT-related errors
export function useNFTErrorHandler() {
  const [error, setError] = React.useState<string>("");
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleError = React.useCallback((err: unknown, context?: string) => {
    console.error(`NFT Error${context ? ` (${context})` : ""}:`, err);

    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === "string") {
      setError(err);
    } else {
      setError("An unexpected error occurred");
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError("");
  }, []);

  const retry = React.useCallback(
    async (retryFn: () => Promise<void>) => {
      setIsRetrying(true);
      setError("");

      try {
        await retryFn();
      } catch (err) {
        handleError(err, "retry");
      } finally {
        setIsRetrying(false);
      }
    },
    [handleError],
  );

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry,
  };
}
