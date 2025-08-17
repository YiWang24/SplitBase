"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import WalletSection from "./components/WalletSection";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import CreateSplitForm from "./components/CreateSplitForm";
import { useRouter } from "next/navigation";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    setMounted(true);
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  // 处理消息显示
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
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
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
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          {/* Left side - Logo and App Name */}
          <div className="flex items-center space-x-2">
            <Icon name="wallet" className="text-[var(--app-accent)] text-lg" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--app-foreground)]">
                SplitBase
              </span>
              <span className="text-[8px] text-[var(--app-muted)] leading-none">
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

        {/* 消息提示 */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-start">
              <Icon
                name={message.type === "success" ? "check" : "star"}
                size="sm"
                className={`mt-0.5 mr-2 ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              />
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        <main className="flex-1">
          {activeTab === "home" && (
            <div className="space-y-6 animate-fade-in">
              {/* SplitBase Introduction */}
              <div className="defi-card backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-5 border-b-2 border-[var(--app-card-border)]">
                  <h2 className="text-lg font-bold text-[var(--app-foreground)] flex items-center">
                    <Icon
                      name="wallet"
                      className="mr-3 text-[var(--app-accent)]"
                    />
                    SplitBase
                  </h2>
                  <p className="text-xs text-[var(--app-foreground-muted)] mt-2">
                    Web3 Bill Splitting • Base Pay Settlement
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-[var(--app-accent-light)] rounded-xl defi-border">
                      <Icon
                        name="check"
                        className="mx-auto mb-3 text-[var(--app-accent)]"
                        size="lg"
                      />
                      <p className="text-xs font-semibold text-[var(--app-foreground)]">
                        INSTANT SPLIT
                      </p>
                    </div>
                    <div className="text-center p-4 bg-[var(--app-accent-light)] rounded-xl defi-border">
                      <Icon
                        name="chain"
                        className="mx-auto mb-3 text-[var(--app-accent)]"
                        size="lg"
                      />
                      <p className="text-xs font-semibold text-[var(--app-foreground)]">
                        USDC PAYMENT
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="w-full animate-defi-glow"
                    icon={<Icon name="plus" size="sm" />}
                    size="lg"
                  >
                    CREATE NEW SPLIT
                  </Button>
                </div>
              </div>
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
                icon={
                  <Icon name="arrow-right" size="sm" className="rotate-180" />
                }
              >
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
    </div>
  );
}
