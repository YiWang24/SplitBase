import { NextRequest, NextResponse } from "next/server";
import { getUserSplitBills } from "@/lib/split-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 },
      );
    }

    const bills = await getUserSplitBills(address);

    return NextResponse.json(bills);
  } catch (error) {
    console.error("Error fetching user bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch user bills" },
      { status: 500 },
    );
  }
}
