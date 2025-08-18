"use client";

import { Check } from "lucide-react";
import { useAccount } from "wagmi";
import { SplitBill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReceiptDetail from "@/app/components/ui/receipt-detail";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: SplitBill;
  onCreateNFT?: () => void;
}

export default function CompletionModal({
  isOpen,
  onClose,
  bill,
  onCreateNFT,
}: CompletionModalProps) {
  const { isConnected } = useAccount();

  const handleCreateNFT = async () => {
    if (!onCreateNFT) return;

    try {
      await onCreateNFT();
    } catch (error) {
      console.error("Error creating NFT:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          {/* Success Animation */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>

          <DialogTitle className="text-xl font-bold">
            🎉 Split Completed!
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            All participants have completed payment
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <ReceiptDetail
            bill={bill}
            onCreateNFT={handleCreateNFT}
            isWalletConnected={isConnected}
          />
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="w-full"
          >
            Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
