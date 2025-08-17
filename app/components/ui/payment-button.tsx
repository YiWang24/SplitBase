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
import { AlertCircle, Wallet, CreditCard } from "lucide-react";
import { BASE_PAY_CONFIG } from "@/lib/types";
import { usdcToWei } from "@/lib/split-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentButtonProps {
  recipientAddress: string;
  amount: string; // USDC amount
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

  // Build USDC transfer transaction
  const calls = useMemo(() => {
    if (!address || !recipientAddress || !amount) {
      return [];
    }

    try {
      const amountInWei = usdcToWei(amount);

      // USDC ERC20 transfer call data
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
          value: BigInt(0), // ERC20 transfer doesn't need to send ETH
        },
      ];
    } catch (error) {
      console.error("Error building transaction calls:", error);
      onError("Failed to build transaction data");
      return [];
    }
  }, [address, recipientAddress, amount, onError]);

  // Handle transaction success
  const handleSuccess = useCallback(
    async (response: TransactionResponse) => {
      try {
        const transactionHash = response.transactionReceipts[0].transactionHash;

        console.log(`Payment successful: ${transactionHash}`);

        // Send notification
        await sendNotification({
          title: "Payment Successful!",
          body: `You have successfully paid ${amount} USDC`,
        });

        // Call success callback
        onSuccess(transactionHash);
      } catch (error) {
        console.error("Error handling payment success:", error);
        onError("Payment successful but status update failed");
      }
    },
    [amount, onSuccess, onError, sendNotification],
  );

  // Handle transaction error
  const handleError = useCallback(
    (error: TransactionError) => {
      console.error("Payment transaction failed:", error);

      let errorMessage = "Payment failed";

      // Provide more friendly error messages based on error type
      if (error.message) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient USDC balance";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "User canceled the transaction";
        } else if (error.message.includes("gas")) {
          errorMessage = "Insufficient gas fees";
        } else {
          errorMessage = `Payment failed: ${error.message}`;
        }
      }

      onError(errorMessage);
    },
    [onError],
  );

  if (!address) {
    return (
      <Alert>
        <Wallet className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to make payment
        </AlertDescription>
      </Alert>
    );
  }

  if (calls.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Unable to build payment transaction</AlertDescription>
      </Alert>
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
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
          text={`Pay ${amount} USDC`}
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

      {/* Payment Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3" />
              <span>Payment will be completed via Base Pay (USDC)</span>
            </div>
            <p>• Ensure you have sufficient USDC and ETH for gas fees</p>
            <p>• Status will update automatically after payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
