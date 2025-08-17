"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { SplitBill, Participant } from "@/lib/types";
import {
  calculateBillStats,
  formatAmount,
  formatAddress,
  canJoinBill,
} from "@/lib/split-utils";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";
import { Name, Avatar } from "@coinbase/onchainkit/identity";
import PaymentButton from "./PaymentButton";
import ShareModal from "./ShareModal";
import CompletionModal from "./CompletionModal";

interface SplitBillDetailProps {
  billId: string;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export default function SplitBillDetail({
  billId,
  onError,
  onSuccess,
}: SplitBillDetailProps) {
  const { address } = useAccount();
  const [bill, setBill] = useState<SplitBill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // 获取分账详情
  const fetchBillDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/split/${billId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const newBill = result.data;
        const oldStatus = bill?.status;
        setBill(newBill);

        // 如果状态从非完成变为完成，显示完成模态框
        if (oldStatus !== "completed" && newBill.status === "completed") {
          setShowCompletionModal(true);
        }
      } else {
        onError(result.error || "获取分账详情失败");
      }
    } catch (error) {
      console.error("Error fetching bill detail:", error);
      onError("网络错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillDetail();
  }, [billId, refreshKey]);

  // 加入分账
  const handleJoinBill = async () => {
    if (!address || !bill) return;

    const canJoinResult = canJoinBill(bill, address);
    if (!canJoinResult.canJoin) {
      onError(canJoinResult.reason || "无法加入分账");
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch(`/api/split/${billId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "join",
          billId,
          participantAddress: address,
          // TODO: 获取用户的 Basename
          participantBasename: undefined,
          displayName: undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess("成功加入分账！");
        setRefreshKey((prev) => prev + 1); // 触发重新加载
      } else {
        onError(result.error || "加入分账失败");
      }
    } catch (error) {
      console.error("Error joining bill:", error);
      onError("网络错误，请重试");
    } finally {
      setIsJoining(false);
    }
  };

  // 处理支付成功
  const handlePaymentSuccess = async (
    participantId: string,
    txHash: string,
  ) => {
    try {
      const response = await fetch(`/api/split/${billId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "payment",
          participantId,
          transactionHash: txHash,
          status: "paid",
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess("支付成功！");
        setRefreshKey((prev) => prev + 1); // 触发重新加载
      } else {
        onError(result.error || "支付状态更新失败");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      onError("支付状态更新失败");
    }
  };

  // 打开分享模态框
  const handleShare = () => {
    setShowShareModal(true);
  };

  // 创建 NFT 收据
  const handleCreateNFT = async () => {
    // TODO: 实现 NFT 收据生成逻辑
    // 这里可以集成 NFT 铸造服务
    onSuccess("NFT 收据生成功能即将推出！");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-12">
        <Icon
          name="star"
          className="mx-auto mb-4 text-[var(--app-foreground-muted)]"
          size="lg"
        />
        <p className="text-[var(--app-foreground-muted)]">
          分账不存在或已被删除
        </p>
      </div>
    );
  }

  const stats = calculateBillStats(bill);
  const userParticipant = address
    ? bill.participants.find(
        (p) => p.address.toLowerCase() === address.toLowerCase(),
      )
    : null;
  const isCreator =
    address && bill.creatorAddress.toLowerCase() === address.toLowerCase();
  const canJoinResult = address
    ? canJoinBill(bill, address)
    : { canJoin: false };

  return (
    <div className="space-y-6">
      {/* 分账标题和状态 */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--app-foreground)] mb-1">
              {bill.title}
            </h1>
            {bill.description && (
              <p className="text-[var(--app-foreground-muted)] text-sm">
                {bill.description}
              </p>
            )}
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              bill.status === "completed"
                ? "bg-green-100 text-green-800"
                : bill.status === "active"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {bill.status === "completed"
              ? "已完成"
              : bill.status === "active"
                ? "进行中"
                : "已取消"}
          </div>
        </div>

        {/* 金额信息 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-[var(--app-foreground-muted)]">总金额</p>
            <p className="text-2xl font-bold text-[var(--app-foreground)]">
              {formatAmount(bill.totalAmount, 2)} USDC
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-[var(--app-foreground-muted)]">
              每人支付
            </p>
            <p className="text-2xl font-bold text-[var(--app-accent)]">
              {formatAmount(bill.amountPerPerson, 2)} USDC
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-[var(--app-foreground-muted)] mb-1">
            <span>完成进度</span>
            <span>{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-[var(--app-gray)] rounded-full h-2">
            <div
              className="bg-[var(--app-accent)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--app-foreground-muted)] mt-1">
            <span>
              {stats.paidParticipants}/{bill.participantCount} 人已支付
            </span>
            <span>{formatAmount(stats.totalPaid, 2)} USDC 已收到</span>
          </div>
        </div>

        {/* 分享按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="w-full"
          icon={<Icon name="star" size="sm" />}
        >
          分享分账
        </Button>
      </div>

      {/* 参与者列表 */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)]">
        <div className="px-5 py-4 border-b border-[var(--app-card-border)]">
          <h2 className="text-lg font-semibold text-[var(--app-foreground)]">
            参与者 ({bill.participants.length}/{bill.participantCount})
          </h2>
        </div>

        <div className="divide-y divide-[var(--app-card-border)]">
          {/* 创建者 */}
          <div className="p-4 bg-[var(--app-accent-light)] bg-opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar address={bill.creatorAddress} className="w-8 h-8" />
                <div>
                  <div className="flex items-center space-x-2">
                    <Name
                      address={bill.creatorAddress}
                      className="font-medium text-[var(--app-foreground)]"
                    />
                    <span className="px-2 py-1 bg-[var(--app-accent)] text-white text-xs rounded-full">
                      创建者
                    </span>
                  </div>
                  <p className="text-xs text-[var(--app-foreground-muted)]">
                    {formatAddress(bill.creatorAddress)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--app-foreground)]">
                  收款方
                </p>
              </div>
            </div>
          </div>

          {/* 参与者 */}
          {bill.participants.map((participant: Participant) => (
            <div key={participant.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar address={participant.address} className="w-8 h-8" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-[var(--app-foreground)]">
                        {participant.displayName}
                      </span>
                      {participant.address.toLowerCase() ===
                        address?.toLowerCase() && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          我
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--app-foreground-muted)]">
                      {formatAddress(participant.address)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--app-foreground)]">
                    {formatAmount(participant.amount, 2)} USDC
                  </p>
                  <div
                    className={`text-xs ${
                      participant.status === "paid" ||
                      participant.status === "confirmed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {participant.status === "paid" ||
                    participant.status === "confirmed"
                      ? "已支付"
                      : "待支付"}
                  </div>
                </div>
              </div>

              {/* 支付按钮 */}
              {participant.address.toLowerCase() === address?.toLowerCase() &&
                participant.status === "pending" &&
                bill.status === "active" && (
                  <div className="mt-3">
                    <PaymentButton
                      recipientAddress={bill.creatorAddress}
                      amount={participant.amount}
                      onSuccess={(txHash) =>
                        handlePaymentSuccess(participant.id, txHash)
                      }
                      onError={onError}
                    />
                  </div>
                )}
            </div>
          ))}

          {/* 空位 */}
          {Array.from({
            length: bill.participantCount - bill.participants.length,
          }).map((_, index) => (
            <div key={`empty-${index}`} className="p-4 opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--app-gray)] rounded-full flex items-center justify-center">
                  <Icon
                    name="plus"
                    size="sm"
                    className="text-[var(--app-foreground-muted)]"
                  />
                </div>
                <span className="text-[var(--app-foreground-muted)]">
                  等待参与者加入
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 加入分账按钮 */}
      {!isCreator && !userParticipant && canJoinResult.canJoin && address && (
        <Button
          variant="primary"
          size="lg"
          onClick={handleJoinBill}
          disabled={isJoining}
          className="w-full"
          icon={<Icon name="plus" size="sm" />}
        >
          {isJoining ? "加入中..." : "加入分账"}
        </Button>
      )}

      {/* 无法加入的提示 */}
      {!isCreator && !userParticipant && !canJoinResult.canJoin && (
        <div className="text-center py-4">
          <p className="text-[var(--app-foreground-muted)]">
            {canJoinResult.reason || "无法加入此分账"}
          </p>
        </div>
      )}

      {/* 未连接钱包提示 */}
      {!address && (
        <div className="text-center py-4">
          <p className="text-yellow-500">请连接钱包以参与分账</p>
        </div>
      )}

      {/* 分享模态框 */}
      {bill && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={bill.shareUrl || ""}
          billTitle={bill.title}
          amount={formatAmount(bill.amountPerPerson, 2)}
        />
      )}

      {/* 完成模态框 */}
      {bill && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          bill={bill}
          onCreateNFT={handleCreateNFT}
        />
      )}
    </div>
  );
}
