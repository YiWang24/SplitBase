"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import {
  Identity,
  Address,
  EthBalance,
  IdentityCard,
} from "@coinbase/onchainkit/identity";

import { Copy, ExternalLink, LogOut, CheckCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-neutral-50/80 border-2 border-brand-primary/20 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Wallet className="h-8 w-8 text-neutral-900" />
          </div>
          <DialogTitle className="text-2xl font-black text-neutral-900 tracking-wide">
            WALLET INFO
          </DialogTitle>
        </DialogHeader>

        {isConnected ? (
          <div className="space-y-6">
            {/* Identity Component */}
            <Card className="bg-gradient-to-br from-white/90 to-brand-primary/5 border-2 border-brand-primary/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-neutral-700 uppercase tracking-wide flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-brand-secondary" />
                  IDENTITY
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <IdentityCard
                  address={address}
                  schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                  className="w-full bg-white/80 backdrop-blur-sm border-2 border-brand-primary/20 rounded-xl px-4 py-3 shadow-md"
                  badgeTooltip={true}
                />
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-gradient-to-br from-white/90 to-brand-primary/5 border-2 border-brand-primary/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
                  WALLET ADDRESS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between space-x-3">
                  <div className="flex-1 min-w-0">
                    <Identity
                      address={address}
                      schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                      className="w-full text-sm font-mono text-neutral-800 bg-white/70 border-2 border-brand-primary/20 rounded-xl px-4 py-3 shadow-sm"
                    >
                      <Address />
                    </Identity>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className={`h-12 w-12 p-0 rounded-xl transition-all duration-300 ${
                      copied
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "text-brand-secondary hover:bg-brand-secondary/10 hover:text-brand-secondary"
                    }`}
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Balance */}
            <Card className="bg-gradient-to-br from-white/90 to-brand-primary/5 border-2 border-brand-primary/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
                  ETH BALANCE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-white/80 backdrop-blur-sm border-2 border-brand-primary/20 rounded-xl px-4 py-3 shadow-sm">
                  <EthBalance
                    address={address}
                    className="text-xl font-bold text-neutral-900"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-2 border-brand-primary/30 text-neutral-700 font-bold hover:bg-brand-primary/20 hover:border-brand-primary hover:scale-105 transition-all duration-300 rounded-xl"
                onClick={() => {
                  if (address) {
                    window.open(
                      `https://basescan.org/address/${address}`,
                      "_blank",
                    );
                  }
                }}
              >
                <ExternalLink className="mr-3 h-5 w-5" />
                View on BaseScan
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 border-2 border-red-300 text-red-600 font-bold hover:bg-red-50 hover:border-red-400 hover:scale-105 transition-all duration-300 rounded-xl"
                onClick={handleDisconnect}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-neutral-500" />
            </div>
            <p className="text-neutral-600 font-medium">No wallet connected</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
