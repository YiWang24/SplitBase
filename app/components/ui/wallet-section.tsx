"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Badge } from "@coinbase/onchainkit/identity";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Wallet as WalletIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WalletModal from "./wallet-modal";

export default function WalletSection() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { isConnected, address, isConnecting, isReconnecting } = useAccount();
  const { isFrameReady, context } = useMiniKit();

  // Detect if in MiniKit environment
  const isMiniKitEnvironment = Boolean(context?.client);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Log connection status for debugging
  useEffect(() => {
    if (mounted && isFrameReady) {
      console.log("Wallet status:", {
        isConnected,
        isConnecting,
        isReconnecting,
        isFrameReady,
        isMiniKitEnvironment,
        context: context?.client,
        address: address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : "none",
      });
    }
  }, [
    mounted,
    isFrameReady,
    isConnected,
    isConnecting,
    isReconnecting,
    address,
    context,
    isMiniKitEnvironment,
  ]);

  // Prevent hydration mismatch by not rendering until mounted and frame ready
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  // Show loading state while reconnecting
  if (isConnecting || isReconnecting) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-brand-primary rounded-full animate-pulse"></div>
        <div className="text-xs text-brand-primary">Connecting...</div>
      </div>
    );
  }

  const handleWalletClick = () => {
    if (isConnected) {
      setShowModal(true);
    }
  };

  return (
    <>
      <Wallet>
        <ConnectWallet>
          {isConnected ? (
            <Identity
              address={address}
              schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
              className="flex items-center space-x-2 bg-inherit  rounded-lg px-2 py-1"
            >
              <Avatar className="w-4 h-4 rounded-full" />
              <Name className="text-inherit text-xs font-medium">
                <Badge tooltip={true} />
              </Name>
            </Identity>
          ) : (
            <>
              <WalletIcon className="w-4 h-4" />
              <span className="text-xs">Connect</span>
            </>
          )}
        </ConnectWallet>

        {/* Connected wallet click trigger */}
        {isConnected && (
          <div
            className="absolute inset-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleWalletClick}
          />
        )}
      </Wallet>

      {/* Wallet Modal */}
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
