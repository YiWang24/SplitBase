import { NextRequest, NextResponse } from "next/server";
import { generateNFTId, storeNFT } from "@/lib/nft-storage";
import { createNFTData } from "@/lib/nft-compositor";
import { NFTGenerationParams } from "@/lib/nft-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      params,
      imageData,
      userId,
    }: { params: NFTGenerationParams; imageData: string; userId?: string } = body;

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
