"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import {
  Name,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { base } from "wagmi/chains";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        // You could add a toast notification here
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4 mb-4 defi-card overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[var(--app-card-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--app-foreground)]">
              Wallet Info
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<Icon name="close" size="sm" />}
            >
              Close
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6">
          {isConnected ? (
            <div className="space-y-6">
              {/* Avatar and Name */}
              <div className="flex items-center space-x-4">
                <Avatar
                  address={address}
                  chain={base}
                  className="w-16 h-16 rounded-full border-2 border-[var(--app-accent)]"
                />
                <div className="flex-1">
                  <Name
                    address={address}
                    chain={base}
                    className="text-lg font-semibold text-[var(--app-foreground)] block"
                  />
                  <p className="text-sm text-[var(--app-muted)]">
                    Base Network
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="defi-border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-[var(--app-muted)] mb-1">
                      Address
                    </p>
                    <Address
                      address={address}
                      className="text-sm font-mono text-[var(--app-foreground)]"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    icon={<Icon name="copy" size="sm" />}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Balance */}
              <div className="defi-border rounded-xl p-4">
                <p className="text-xs text-[var(--app-muted)] mb-1">Balance</p>
                <EthBalance
                  address={address}
                  className="text-lg font-semibold text-[var(--app-accent)]"
                />
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  icon={<Icon name="external-link" size="sm" />}
                  onClick={() => {
                    if (address) {
                      window.open(
                        `https://basescan.org/address/${address}`,
                        "_blank",
                      );
                    }
                  }}
                >
                  View on BaseScan
                </Button>

                <Button
                  variant="danger"
                  size="lg"
                  className="w-full"
                  icon={<Icon name="logout" size="sm" />}
                  onClick={handleDisconnect}
                >
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--app-muted)]">No wallet connected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
