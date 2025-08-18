import { NextRequest, NextResponse } from "next/server";
import { getUserNFTs, getUserNFTCount } from "@/lib/nft-storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;

    console.log("NFT list API called with userId:", userId);

    // Check if Redis is available
    const { redis } = await import("@/lib/redis");
    if (!redis) {
      console.error("Redis not available - missing environment variables");
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection not available. Please check server configuration.",
        },
        { status: 503 },
      );
    }

    // Get user's NFTs
    const nfts = await getUserNFTs(userId);
    const count = await getUserNFTCount(userId);

    console.log(`Retrieved ${nfts.length} NFTs for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: {
        nfts,
        count,
        total: nfts.length,
      },
    });
  } catch (error) {
    console.error("NFT list API error:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to retrieve NFTs";
    if (error instanceof Error) {
      if (error.message.includes("Redis not available")) {
        errorMessage =
          "Database connection not available. Please check server configuration.";
      } else if (error.message.includes("REDIS_UNAVAILABLE")) {
        errorMessage = "Database service temporarily unavailable.";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
