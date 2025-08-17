import { NextRequest, NextResponse } from "next/server";
import { createSplitBill, validateSplitBillInput } from "@/lib/split-utils";
import { saveSplitBill } from "@/lib/split-storage";
import { CreateSplitBillInput, ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: CreateSplitBillInput = body;

    // 验证输入数据
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

    // 创建分账
    const bill = createSplitBill(input);

    // 保存到存储
    await saveSplitBill(bill);

    return NextResponse.json<ApiResponse<typeof bill>>({
      success: true,
      data: bill,
      message: "分账创建成功",
    });
  } catch (error) {
    console.error("Error creating split bill:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "创建分账失败",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
