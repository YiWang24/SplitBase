"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import WalletSection from "./ui/wallet-section";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Check, Home, Receipt, Users, Star } from "lucide-react";
import BottomNavigation from "./ui/bottom-navigation";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!isFrameReady) {
      setFrameReady();
    }

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/create");
  };

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      onClick: undefined,
    },
    {
      href: "/bills",
      icon: Receipt,
      label: "Bills",
      onClick: undefined,
    },
    {
      href: "/create",
      icon: Plus,
      label: "Create",
      onClick: handleCreateClick,
    },
    {
      href: "/nfts",
      icon: Star,
      label: "NFTs",
      onClick: undefined,
    },
    {
      href: "/friends",
      icon: Users,
      label: "Friends",
      onClick: undefined,
    },
  ];

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-brand-primary hover:text-brand-primary-dark transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-brand-secondary animate-fade-out">
          <Check className="w-4 h-4 text-brand-secondary" />
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
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)] overflow-hidden relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur-sm z-50 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          {/* Left side - Logo and App Name */}
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 md:h-6 md:w-6 text-brand-primary" />
            <div className="flex flex-col">
              <span className="text-sm md:text-lg font-bold text-neutral-800 dark:text-neutral-100">
                SplitBase
              </span>
              <span className="text-[8px] md:text-xs text-neutral-600 dark:text-neutral-400 leading-none">
                Base Pay Splits
              </span>
            </div>
          </div>

          {/* Center - Navigation (Web only) */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                let isActive = false;
                            if (item.label === "Home") {
              isActive = pathname === "/";
            } else if (item.label === "Bills") {
                  isActive = pathname === "/bills";
                } else if (item.label === "Create") {
                  isActive = pathname === "/create";
                } else if (item.label === "NFTs") {
                  isActive = pathname === "/nfts";
                } else if (item.label === "Friends") {
                  isActive = pathname === "/friends";
                }

                if (item.onClick) {
                  return (
                    <Button
                      key={item.href}
                      onClick={item.onClick}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "flex flex-col h-auto py-2 px-3 font-mono text-xs md:text-sm tracking-wider transition-all duration-200",
                        isActive
                          ? "bg-brand-primary text-neutral-900 transform -translate-y-0.5 shadow-md hover:bg-brand-primary-dark"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:transform hover:-translate-y-0.5",
                      )}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5 mb-1" />
                      <span className="text-[8px] md:text-xs font-normal">
                        {item.label.toUpperCase()}
                      </span>
                    </Button>
                  );
                }

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "flex flex-col h-auto py-2 px-3 font-mono text-xs md:text-sm tracking-wider transition-all duration-200",
                        isActive
                          ? "bg-brand-primary text-neutral-900 transform -translate-y-0.5 shadow-md hover:bg-brand-primary-dark"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:transform hover:-translate-y-0.5",
                      )}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5 mb-1" />
                      <span className="text-[8px] md:text-xs font-normal">
                        {item.label.toUpperCase()}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side - User Avatar and Name */}
          <div className="flex items-center space-x-2">
            <WalletSection />
            {saveFrameButton && <div className="ml-2">{saveFrameButton}</div>}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-20 pb-20 md:pb-0">
        {children}
      </main>

      {/* Footer - Web only */}
      {!isMobile && (
        <footer className="mt-auto w-full border-t border-neutral-200 bg-neutral-50/80 backdrop-blur-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300">
          <div className="w-full max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 text-xs font-normal transition-colors duration-200"
                onClick={() => openUrl("https://base.org/builders/minikit")}
              >
                <span className="text-xs">Built with ❤️ on Base</span>
              </Button>
            </div>
          </div>
        </footer>
      )}

      {/* Bottom Navigation - Mobile only */}
      {isMobile && <BottomNavigation />}
    </div>
  );
}
