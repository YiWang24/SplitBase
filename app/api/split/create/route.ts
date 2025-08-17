import { NextRequest, NextResponse } from "next/server";
import { createSplitBill, validateSplitBillInput } from "@/lib/split-utils";
import { saveSplitBill } from "@/lib/split-storage";
import { CreateSplitBillInput, ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: CreateSplitBillInput = body;

    // Validate input data
    const validation = validateSplitBillInput(input);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: validation.errors.join(", "),
        },
        { status: 400 },
      );
    }

    // Create split bill
    const bill = createSplitBill(input);

    // Save to storage
    await saveSplitBill(bill);

    return NextResponse.json<ApiResponse<typeof bill>>({
      success: true,
      data: bill,
      message: "Split bill created successfully",
    });
  } catch (error) {
    console.error("Error creating split bill:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create split bill",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
