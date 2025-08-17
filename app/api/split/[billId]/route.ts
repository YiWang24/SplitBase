import { NextRequest, NextResponse } from "next/server";
import {
  getSplitBill,
  updateSplitBill,
  deleteSplitBill,
} from "@/lib/split-storage";
import { addParticipant, updateParticipantPayment } from "@/lib/split-utils";
import {
  ApiResponse,
  JoinSplitBillInput,
  PaymentStatusUpdate,
} from "@/lib/types";

interface RouteParams {
  params: {
    billId: string;
  };
}

// 获取分账详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const billId = resolvedParams.billId;

    if (!billId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "分账ID不能为空",
        },
        { status: 400 },
      );
    }

    const bill = await getSplitBill(billId);

    if (!bill) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "分账不存在",
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
        error: error instanceof Error ? error.message : "获取分账失败",
      },
      { status: 500 },
    );
  }
}

// 更新分账 (加入参与者或更新支付状态)
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
          error: "分账ID不能为空",
        },
        { status: 400 },
      );
    }

    const bill = await getSplitBill(billId);
    if (!bill) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "分账不存在",
        },
        { status: 404 },
      );
    }

    let updatedBill = bill;

    if (action === "join") {
      // 加入分账
      const joinData: JoinSplitBillInput = body;
      updatedBill = addParticipant(
        bill,
        joinData.participantAddress,
        joinData.participantBasename,
        joinData.displayName,
      );
    } else if (action === "payment") {
      // 更新支付状态
      const paymentData: PaymentStatusUpdate = body;
      if (!paymentData.transactionHash) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "交易哈希不能为空",
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
          error: "无效的操作类型",
        },
        { status: 400 },
      );
    }

    // 保存更新
    await updateSplitBill(updatedBill);

    return NextResponse.json<ApiResponse<typeof updatedBill>>({
      success: true,
      data: updatedBill,
      message: action === "join" ? "成功加入分账" : "支付状态更新成功",
    });
  } catch (error) {
    console.error("Error updating split bill:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "更新分账失败",
      },
      { status: 500 },
    );
  }
}

// 删除分账
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const billId = resolvedParams.billId;

    if (!billId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "分账ID不能为空",
        },
        { status: 400 },
      );
    }

    await deleteSplitBill(billId);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "分账删除成功",
    });
  } catch (error) {
    console.error("Error deleting split bill:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "删除分账失败",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
