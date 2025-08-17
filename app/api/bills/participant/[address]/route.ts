import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getSplitBill } from "@/lib/split-storage";

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

    if (!redis) {
      return NextResponse.json(
        { error: "Redis connection unavailable" },
        { status: 503 },
      );
    }

    // Get all bill keys
    const pattern = "split_bill:*";
    const keys = await redis.keys(pattern);

    const participantBills = [];

    // Check each bill to see if the address is a participant
    for (const key of keys) {
      const billId = key.replace("split_bill:", "");
      const bill = await getSplitBill(billId);

      if (bill && bill.creatorAddress.toLowerCase() !== address.toLowerCase()) {
        // Check if address is in participants
        const isParticipant = bill.participants.some(
          (participant) =>
            participant.address.toLowerCase() === address.toLowerCase(),
        );

        if (isParticipant) {
          participantBills.push(bill);
        }
      }
    }

    // Sort by creation date (newest first)
    participantBills.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json(participantBills);
  } catch (error) {
    console.error("Error fetching participant bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant bills" },
      { status: 500 },
    );
  }
}
