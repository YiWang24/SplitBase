import { NextRequest, NextResponse } from "next/server";
import { generateNFTId, storeNFT } from "@/lib/nft-storage";
import { createNFTData } from "@/lib/nft-compositor";
import { NFTGenerationParams } from "@/lib/nft-types";
import { getSplitBill, updateSplitBill } from "@/lib/split-storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      params,
      imageData,
      userId,
    }: { params: NFTGenerationParams; imageData: string; userId?: string } =
      body;

    // Validate required fields
    if (!params || !imageData) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 },
      );
    }

    if (!params.participants || params.participants.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one participant is required" },
        { status: 400 },
      );
    }

    if (!params.totalAmount || params.totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid total amount is required" },
        { status: 400 },
      );
    }

    // Generate unique NFT ID
    const nftId = generateNFTId();

    // Create NFT data object
    const nftData = createNFTData(params, imageData, nftId, userId);

    // Store in Redis
    const result = await storeNFT(nftData);

    if (result.success) {
      // Update the bill with NFT information
      try {
        const bill = await getSplitBill(params.billId);
        if (bill && userId) {
          // Find the participant by userId (address) and update their nftReceiptId
          const participantIndex = bill.participants.findIndex(
            (participant) =>
              participant.address.toLowerCase() === userId.toLowerCase(),
          );

          if (participantIndex !== -1) {
            // Update the specific participant's nftReceiptId
            bill.participants[participantIndex] = {
              ...bill.participants[participantIndex],
              nftReceiptId: nftId,
            };

            // Also keep the legacy nftReceiptId for backward compatibility
            bill.nftReceiptId = nftId;
            bill.updatedAt = new Date();

            await updateSplitBill(bill);
          }
        }
      } catch (error) {
        console.error("Error updating bill with NFT ID:", error);
        // Don't fail the NFT creation if bill update fails
      }

      return NextResponse.json({
        success: true,
        nftId: result.nftId,
        message: "NFT created successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("NFT creation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
