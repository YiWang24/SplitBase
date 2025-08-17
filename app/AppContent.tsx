"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import WalletSection from "./components/ui/wallet-section";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Check, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CreateSplitForm from "./components/ui/create-split-form";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNavigation from "./components/ui/bottom-navigation";

export default function AppContent() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    setMounted(true);
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Handle URL parameters
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "create") {
      setActiveTab("create");
    }
  }, [searchParams]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  // Handle message display
  const handleSuccess = (text: string) => {
    setMessage({ type: "success", text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (text: string) => {
    setMessage({ type: "error", text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handle split creation success
  const handleSplitCreated = (billId: string) => {
    handleSuccess("Split created successfully!");
    setTimeout(() => {
      router.push(`/split/${billId}`);
    }, 1000);
  };

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Check className="w-4 h-4 text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3 pb-20">
        <header className="flex justify-between items-center mb-3 h-11">
          {/* Left side - Logo and App Name */}
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">SplitBase</span>
              <span className="text-[8px] text-muted-foreground leading-none">
                Base Pay Splits
              </span>
            </div>
          </div>

          {/* Right side - User Avatar and Name */}
          <div className="flex items-center space-x-2">
            <WalletSection />
            {saveFrameButton && <div className="ml-2">{saveFrameButton}</div>}
          </div>
        </header>

        {/* Message Alert */}
        {message && (
          <Alert
            className={`mb-4 ${
              message.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start">
              {message.type === "success" ? (
                <Check className={`h-4 w-4 mt-0.5 mr-2 text-green-600`} />
              ) : (
                <Plus className={`h-4 w-4 mt-0.5 mr-2 text-red-600`} />
              )}
              <AlertDescription
                className={`text-sm ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.text}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <main className="flex-1">
          {activeTab === "home" && (
            <div className="space-y-6 animate-fade-in">
              {/* SplitBase Introduction */}
              <Card className="backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Wallet className="mr-3 h-5 w-5 text-primary" />
                    SplitBase
                  </CardTitle>
                  <CardDescription>
                    Web3 Bill Splitting • Base Pay Settlement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-xl border">
                      <Check className="mx-auto mb-3 h-8 w-8 text-primary" />
                      <p className="text-xs font-semibold">INSTANT SPLIT</p>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-xl border">
                      <Wallet className="mx-auto mb-3 h-8 w-8 text-primary" />
                      <p className="text-xs font-semibold">USDC PAYMENT</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    CREATE NEW SPLIT
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          {activeTab === "create" && (
            <div className="space-y-6 animate-fade-in">
              <CreateSplitForm
                onSuccess={handleSplitCreated}
                onError={handleError}
              />
              <Button
                variant="outline"
                onClick={() => setActiveTab("home")}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                BACK TO HOME
              </Button>
            </div>
          )}
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit & OnchainKit
          </Button>
        </footer>
      </div>
      <BottomNavigation />
    </div>
  );
}
