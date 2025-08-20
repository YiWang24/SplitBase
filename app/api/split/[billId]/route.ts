import { NextRequest, NextResponse } from "next/server";
import {
  getSplitBill,
  updateSplitBill,
  deleteSplitBill,
} from "@/lib/split-storage";
import { addParticipant, updateParticipantPayment } from "@/lib/split-utils";
import { manageFriendRelationships } from "@/lib/friend-utils";
import {
  ApiResponse,
  JoinSplitBillInput,
  PaymentStatusUpdate,
} from "@/lib/types";

interface RouteParams {
  params: Promise<{
    billId: string;
  }>;
}

// Get split bill details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const billId = resolvedParams.billId;

    if (!billId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Split bill ID cannot be empty",
        },
        { status: 400 },
      );
    }

    const bill = await getSplitBill(billId);

    if (!bill) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Split bill not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<typeof bill>>({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Error getting split bill:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get split bill",
      },
      { status: 500 },
    );
  }
}

// Update split bill (join participants or update payment status)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const billId = resolvedParams.billId;
    const body = await request.json();
    const action = body.action as "join" | "payment";

    if (!billId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Split bill ID cannot be empty",
        },
        { status: 400 },
      );
    }

    const bill = await getSplitBill(billId);
    if (!bill) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Split bill not found",
        },
        { status: 404 },
      );
    }

    let updatedBill = bill;

    if (action === "join") {
      // Join split bill
      const joinData: JoinSplitBillInput = body;
      updatedBill = addParticipant(
        bill,
        joinData.participantAddress,
        joinData.participantBasename,
        joinData.displayName,
      );

      // After successfully adding participant, manage friend relationships
      try {
        await manageFriendRelationships(
          updatedBill,
          joinData.participantAddress,
        );
      } catch (friendError) {
        console.warn("Failed to manage friend relationships:", friendError);
        // Don't fail the entire operation if friend management fails
      }
    } else if (action === "payment") {
      // Update payment status
      const paymentData: PaymentStatusUpdate = body;
      if (!paymentData.transactionHash) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "Transaction hash cannot be empty",
          },
          { status: 400 },
        );
      }

      updatedBill = updateParticipantPayment(
        bill,
        paymentData.participantId,
        paymentData.transactionHash,
        paymentData.status,
      );
    } else {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid operation type",
        },
        { status: 400 },
      );
    }

    // Save updates
    await updateSplitBill(updatedBill);

    return NextResponse.json<ApiResponse<typeof updatedBill>>({
      success: true,
      data: updatedBill,
      message:
        action === "join"
          ? "Successfully joined split bill"
          : "Payment status updated successfully",
    });
  } catch (error) {
    console.error("Error updating split bill:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update split bill",
      },
      { status: 500 },
    );
  }
}

// Delete split bill
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const billId = resolvedParams.billId;

    if (!billId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Split bill ID cannot be empty",
        },
        { status: 400 },
      );
    }

    await deleteSplitBill(billId);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Split bill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting split bill:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete split bill",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
