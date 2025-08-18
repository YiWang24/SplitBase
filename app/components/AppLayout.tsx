"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import WalletSection from "./ui/wallet-section";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Check } from "lucide-react";
import BottomNavigation from "./ui/bottom-navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)] overflow-x-hidden relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 border-b border-border bg-card/50 backdrop-blur-sm z-50 text-gray-900 dark:text-gray-100">
        <div className="w-full max-w-md mx-auto flex justify-between items-center">
          {/* Left side - Logo and App Name */}
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                SplitBase
              </span>
              <span className="text-[8px] text-gray-700 dark:text-gray-300 leading-none">
                Base Pay Splits
              </span>
            </div>
          </div>

          {/* Right side - User Avatar and Name */}
          <div className="flex items-center space-x-2">
            <WalletSection />
            {saveFrameButton && <div className="ml-2">{saveFrameButton}</div>}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden pt-20">{children}</main>

      {/* Footer */}
      <footer className="mt-auto pt-4 pb-24 border-t border-border bg-card/50 backdrop-blur-sm w-full text-gray-800 dark:text-gray-200">
        <div className="w-full max-w-md mx-auto px-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 text-xs font-normal"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            <span className="text-xs">Built with ❤️ on Base</span>
          </Button>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
