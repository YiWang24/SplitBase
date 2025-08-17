"use client";

import { useState, useEffect } from "react";
import { SplitBill } from "@/lib/types";
import { formatAmount, calculateBillStats } from "@/lib/split-utils";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: SplitBill;
  onCreateNFT?: () => void;
}

export default function CompletionModal({
  isOpen,
  onClose,
  bill,
  onCreateNFT,
}: CompletionModalProps) {
  const [isCreatingNFT, setIsCreatingNFT] = useState(false);

  if (!isOpen) return null;

  const stats = calculateBillStats(bill);
  const [completedAt, setCompletedAt] = useState<string>("");

  useEffect(() => {
    // Set the completed date only on client side to avoid hydration mismatch
    setCompletedAt(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  const handleCreateNFT = async () => {
    if (!onCreateNFT) return;

    setIsCreatingNFT(true);
    try {
      await onCreateNFT();
    } catch (error) {
      console.error("Error creating NFT:", error);
    } finally {
      setIsCreatingNFT(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--app-card-bg)] rounded-xl shadow-xl border border-[var(--app-card-border)] w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="relative p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-[var(--app-gray)] flex items-center justify-center text-[var(--app-foreground-muted)]"
          >
            ×
          </button>

          {/* 成功动画 */}
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="check" size="lg" className="text-green-600" />
          </div>

          <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-2">
            🎉 分账完成！
          </h3>
          <p className="text-sm text-[var(--app-foreground-muted)]">
            所有参与者已完成支付
          </p>
        </div>

        {/* 分账摘要 */}
        <div className="px-6 pb-6 space-y-4">
          {/* 基本信息 */}
          <div className="bg-[var(--app-accent-light)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--app-foreground)] mb-3">
              {bill.title}
            </h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--app-foreground-muted)]">总金额</p>
                <p className="font-bold text-[var(--app-foreground)]">
                  {formatAmount(bill.totalAmount, 2)} USDC
                </p>
              </div>
              <div>
                <p className="text-[var(--app-foreground-muted)]">参与人数</p>
                <p className="font-bold text-[var(--app-foreground)]">
                  {bill.participantCount} 人
                </p>
              </div>
              <div>
                <p className="text-[var(--app-foreground-muted)]">每人支付</p>
                <p className="font-bold text-[var(--app-accent)]">
                  {formatAmount(bill.amountPerPerson, 2)} USDC
                </p>
              </div>
              <div>
                <p className="text-[var(--app-foreground-muted)]">
                  Completed At
                </p>
                <p className="font-bold text-[var(--app-foreground)]">
                  {completedAt || "Loading..."}
                </p>
              </div>
            </div>
          </div>

          {/* 参与者列表 */}
          <div className="bg-[var(--app-gray)] rounded-lg p-4">
            <h5 className="font-medium text-[var(--app-foreground)] mb-3">
              参与者 ({stats.paidParticipants}/{bill.participantCount})
            </h5>

            <div className="space-y-2">
              {bill.participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--app-foreground)]">
                    {participant.displayName}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[var(--app-foreground-muted)]">
                      {formatAmount(participant.amount, 2)} USDC
                    </span>
                    <Icon name="check" size="sm" className="text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NFT 收据 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Icon name="star" size="sm" className="text-white" />
              </div>

              <div className="flex-1">
                <h5 className="font-medium text-gray-800 mb-1">
                  生成 NFT 收据
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                  将此次分账记录铸造为 NFT，作为数字收据永久保存
                </p>

                {bill.nftReceiptId ? (
                  <div className="flex items-center space-x-2">
                    <Icon name="check" size="sm" className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      NFT 收据已生成
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateNFT}
                    disabled={isCreatingNFT}
                    icon={<Icon name="star" size="sm" />}
                  >
                    {isCreatingNFT ? "生成中..." : "生成 NFT 收据"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg p-4">
            <h5 className="font-medium text-[var(--app-foreground)] mb-3">
              📊 分账统计
            </h5>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-green-600 font-bold">100%</p>
                <p className="text-green-700">完成率</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="text-blue-600 font-bold">
                  {stats.paidParticipants}
                </p>
                <p className="text-blue-700">已支付人数</p>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="text-center space-y-2">
            <p className="text-xs text-[var(--app-foreground-muted)]">
              💡 所有交易已在 Base 网络上完成
            </p>
            <p className="text-xs text-[var(--app-foreground-muted)]">
              🔗 数据已保存，可随时查看历史记录
            </p>
          </div>

          {/* 关闭按钮 */}
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="w-full"
          >
            完成
          </Button>
        </div>
      </div>
    </div>
  );
}
