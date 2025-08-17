"use client";

import { useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { BASE_PAY_CONFIG } from "@/lib/types";
import { usdcToWei } from "@/lib/split-utils";

interface PaymentButtonProps {
  recipientAddress: string;
  amount: string; // USDC 金额
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
}

export default function PaymentButton({
  recipientAddress,
  amount,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const { address } = useAccount();
  const sendNotification = useNotification();

  // 构建 USDC 转账交易
  const calls = useMemo(() => {
    if (!address || !recipientAddress || !amount) {
      return [];
    }

    try {
      const amountInWei = usdcToWei(amount);

      // USDC ERC20 转账调用数据
      // transfer(address to, uint256 amount)
      const transferFunctionSelector = "0xa9059cbb";
      const recipientAddressPadded = recipientAddress
        .slice(2)
        .padStart(64, "0");
      const amountHex = amountInWei.toString(16).padStart(64, "0");
      const transferData =
        `${transferFunctionSelector}${recipientAddressPadded}${amountHex}` as `0x${string}`;

      return [
        {
          to: BASE_PAY_CONFIG.USDC_CONTRACT_ADDRESS as `0x${string}`,
          data: transferData,
          value: BigInt(0), // ERC20 转账不需要发送 ETH
        },
      ];
    } catch (error) {
      console.error("Error building transaction calls:", error);
      onError("构建交易数据失败");
      return [];
    }
  }, [address, recipientAddress, amount, onError]);

  // 处理交易成功
  const handleSuccess = useCallback(
    async (response: TransactionResponse) => {
      try {
        const transactionHash = response.transactionReceipts[0].transactionHash;

        console.log(`Payment successful: ${transactionHash}`);

        // 发送通知
        await sendNotification({
          title: "支付成功！",
          body: `您已成功支付 ${amount} USDC`,
        });

        // 调用成功回调
        onSuccess(transactionHash);
      } catch (error) {
        console.error("Error handling payment success:", error);
        onError("支付成功但状态更新失败");
      }
    },
    [amount, onSuccess, onError, sendNotification],
  );

  // 处理交易错误
  const handleError = useCallback(
    (error: TransactionError) => {
      console.error("Payment transaction failed:", error);

      let errorMessage = "支付失败";

      // 根据错误类型提供更友好的错误信息
      if (error.message) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "USDC 余额不足";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "用户取消了交易";
        } else if (error.message.includes("gas")) {
          errorMessage = "Gas 费用不足";
        } else {
          errorMessage = `支付失败: ${error.message}`;
        }
      }

      onError(errorMessage);
    },
    [onError],
  );

  if (!address) {
    return (
      <div className="text-center py-2">
        <p className="text-yellow-500 text-sm">请连接钱包以进行支付</p>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-red-500 text-sm">无法构建支付交易</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Transaction
        calls={calls}
        onSuccess={handleSuccess}
        onError={handleError}
      >
        <TransactionButton
          className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white font-medium py-2 px-4 rounded-lg transition-colors"
          text={`支付 ${amount} USDC`}
        />

        <TransactionStatus>
          <TransactionStatusAction />
          <TransactionStatusLabel />
        </TransactionStatus>

        <TransactionToast className="mb-2">
          <TransactionToastIcon />
          <TransactionToastLabel />
          <TransactionToastAction />
        </TransactionToast>
      </Transaction>

      {/* 支付说明 */}
      <div className="text-xs text-[var(--app-foreground-muted)] space-y-1">
        <p>• 支付将通过 Base Pay (USDC) 完成</p>
        <p>• 请确保您的钱包有足够的 USDC 和少量 ETH 作为 Gas 费</p>
        <p>• 支付完成后将自动更新状态</p>
      </div>
    </div>
  );
}
