"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import {
  Identity,
  Address,
  EthBalance,
  IdentityCard,
} from "@coinbase/onchainkit/identity";

import { Copy, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  if (!mounted) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono tracking-wider">
            WALLET INFO
          </DialogTitle>
        </DialogHeader>

        {isConnected ? (
          <div className="space-y-6">
            {/* Identity Component */}

            <IdentityCard
              address={address}
              schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
              className=" space-x-2 bg-inherit border-stone-200 border-2 rounded-lg px-2 py-1"
              badgeTooltip={true}
            />

            <Separator />

            {/* Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Address</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Identity
                      address={address}
                      schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                      className="text-sm font-mono text-muted-foreground truncate bg-inherit border-stone-200 border-2 rounded-lg px-2 py-1"
                    >
                      <Address/>
                    </Identity>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Balance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Balance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <EthBalance
                  address={address}
                  className="text-lg font-semibold text-primary"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  if (address) {
                    window.open(
                      `https://basescan.org/address/${address}`,
                      "_blank",
                    );
                  }
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on BaseScan
              </Button>

              <Button
                variant="destructive"
                size="lg"
                className="w-full"
                onClick={handleDisconnect}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No wallet connected</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
