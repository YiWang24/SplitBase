import { NextRequest, NextResponse } from "next/server";
import { getNFT } from "@/lib/nft-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nftId: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const { nftId } = await params;

    if (!nftId) {
      return NextResponse.json(
        { success: false, error: "NFT ID is required" },
        { status: 400 },
      );
    }

    const nft = await getNFT(nftId, userId);

    if (!nft) {
      return NextResponse.json(
        { success: false, error: "NFT not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: nft,
    });
  } catch (error) {
    console.error("NFT retrieval API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to retrieve NFT",
      },
      { status: 500 },
    );
  }
}
