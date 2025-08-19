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

  const { address } = useAccount();

  const handleNFTCreated = (nftId: string) => {
    console.log("=== handleNFTCreated called ===");
    console.log("NFT created successfully:", nftId);
    console.log("Current billId:", billId);
    console.log("Preparing to navigate to:", `/nfts/${nftId}`);

    setShowNFTModal(false);

    // Update local bill state to include NFT information in the participant
    if (bill && address) {
      setBill({
        ...bill,
        participants: bill.participants.map((participant) =>
          participant.address?.toLowerCase() === address?.toLowerCase()
            ? { ...participant, nftReceiptId: nftId }
            : participant,
        ),
        updatedAt: new Date(),
      });
    }

    // Add a delay to show the success message
    console.log("Scheduling navigation in 1 second...");
    setTimeout(() => {
      console.log("Executing navigation to:", `/nfts/${nftId}`);
      router.push(`/nfts/${nftId}`);
    }, 500);
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
