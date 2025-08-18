"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ReceiptDetail from "@/app/components/ui/receipt-detail";
import NFTCreationModal from "@/app/components/ui/nft-creation-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SplitBill } from "@/lib/types";

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useAccount();
  const [bill, setBill] = useState<SplitBill | null>(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const billId = params.billId as string;

  // Fetch bill data when component mounts
  useEffect(() => {
    const fetchBill = async () => {
      if (!billId) return;
      try {
        const response = await fetch(`/api/split/${billId}`);
        const result = await response.json();
        if (result?.success && result?.data) {
          setBill(result.data as SplitBill);
        }
      } catch (error) {
        console.error("Error fetching bill:", error);
      }
    };

    fetchBill();
  }, [billId]);

  const handleCreateNFT = async () => {
    if (bill) {
      setShowNFTModal(true);
    }
  };

  const handleNFTCreated = (nftId: string) => {
    console.log("NFT created successfully:", nftId);
    setShowNFTModal(false);

    // Redirect to the newly created NFT detail page
    router.push(`/nfts/${nftId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button variant="ghost" size="sm" onClick={() => router.push("/bills")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Bills
        </Button>
      </div>
      <ReceiptDetail
        billId={billId}
        bill={bill || undefined}
        isWalletConnected={isConnected}
        onCreateNFT={handleCreateNFT}
      />

      {/* NFT Creation Modal */}
      {bill && (
        <NFTCreationModal
          isOpen={showNFTModal}
          onClose={() => setShowNFTModal(false)}
          bill={bill}
          onNFTCreated={handleNFTCreated}
        />
      )}
    </div>
  );
}
