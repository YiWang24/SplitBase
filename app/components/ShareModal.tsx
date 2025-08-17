"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  billTitle: string;
  amount: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  billTitle,
  amount,
}: ShareModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 生成二维码
  useEffect(() => {
    if (isOpen && shareUrl) {
      generateQRCode();
    }
  }, [isOpen, shareUrl]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // 分享到社交媒体 (模拟)
  const handleShare = async () => {
    const shareText = `💰 ${billTitle}\n每人支付: ${amount} USDC\n快来加入分账吧！\n\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SplitBase - ${billTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        // 降级到复制链接
        handleCopyLink();
      }
    } else {
      // 降级到复制链接
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--app-card-bg)] rounded-xl shadow-xl border border-[var(--app-card-border)] w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-semibold text-[var(--app-foreground)]">
            分享分账
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--app-gray)] flex items-center justify-center text-[var(--app-foreground-muted)]"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 分账信息 */}
          <div className="text-center">
            <h4 className="font-medium text-[var(--app-foreground)] mb-1">
              {billTitle}
            </h4>
            <p className="text-sm text-[var(--app-foreground-muted)]">
              每人支付:{" "}
              <span className="font-medium text-[var(--app-accent)]">
                {amount} USDC
              </span>
            </p>
          </div>

          {/* 二维码 */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border">
              {isGenerating ? (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
                </div>
              ) : qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="分账二维码"
                  className="w-[200px] h-[200px]"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-[var(--app-foreground-muted)]">
                  二维码生成失败
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center text-[var(--app-foreground-muted)]">
            扫描二维码或分享链接邀请朋友加入
          </p>

          {/* 分享链接 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                icon={<Icon name={copySuccess ? "check" : "star"} size="sm" />}
              >
                {copySuccess ? "已复制" : "复制"}
              </Button>
            </div>

            {/* 分享按钮 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleShare}
                icon={<Icon name="star" size="sm" />}
              >
                分享
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                icon={<Icon name="plus" size="sm" />}
              >
                复制链接
              </Button>
            </div>
          </div>

          {/* 提示 */}
          <div className="bg-[var(--app-accent-light)] rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Icon
                name="star"
                size="sm"
                className="text-[var(--app-accent)] mt-0.5"
              />
              <div className="text-xs text-[var(--app-foreground)]">
                <p className="font-medium mb-1">分享提示:</p>
                <ul className="space-y-1 text-[var(--app-foreground-muted)]">
                  <li>• 朋友需要连接 Base 钱包</li>
                  <li>• 支付使用 USDC 完成</li>
                  <li>• 支付后会自动更新状态</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-[var(--app-card-border)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}
