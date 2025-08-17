"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Name, Avatar } from "@coinbase/onchainkit/identity";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { base } from "wagmi/chains";
import WalletModal from "./WalletModal";

export default function WalletSection() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { isConnected, address, isConnecting, isReconnecting } = useAccount();
  const { isFrameReady, context } = useMiniKit();

  // 检测是否在MiniKit环境中
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
        <div className="w-6 h-6 bg-[var(--app-gray)] rounded-full animate-pulse"></div>
        <div className="w-16 h-4 bg-[var(--app-gray)] rounded animate-pulse"></div>
      </div>
    );
  }

  // Show loading state while reconnecting
  if (isConnecting || isReconnecting) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-[var(--app-accent)] rounded-full animate-pulse"></div>
        <div className="text-xs text-[var(--app-accent)]">Connecting...</div>
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
      <div className="relative">
        <Wallet>
          <ConnectWallet>
            <div className="flex items-center space-x-2">
              <Avatar
                address={address}
                chain={base}
                className="w-6 h-6 rounded-full"
              />
              <Name
                address={address}
                chain={base}
                className="text-inherit text-xs font-medium"
              />
            </div>
          </ConnectWallet>

          {/* Connected wallet click trigger */}
          {isConnected && (
            <div
              className="absolute inset-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleWalletClick}
            />
          )}
        </Wallet>
      </div>

      {/* Wallet Modal */}
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
