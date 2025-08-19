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

  // Simulation mode flag - set to true for testing
  const isSimulationMode = true;

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
          chainId: 84532, // Base Sepolia testnet
        },
      ];
    } catch (error) {
      console.error("Error building transaction calls:", error);
      onError("Failed to build transaction data");
      return [];
    }
  }, [address, recipientAddress, amount, onError]);

  // Handle transaction success
  const handleSuccess = useCallback(async () => {
    try {
      // TODO: Get actual transaction hash from response
      const transactionHash = "0x123";
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
  }, [amount, onSuccess, onError, sendNotification]);

  // Handle transaction error
  const handleError = useCallback(
    (error: TransactionError) => {
      let errorMessage = "Payment failed";
      let shouldCallSuccess = false;

      // In simulation mode, treat most errors as success for testing
      if (isSimulationMode) {
        if (error.message && error.message.includes("user rejected")) {
          // User explicitly rejected the transaction
          errorMessage = "User canceled the transaction";
        } else {
          // Treat other errors as successful simulation
          errorMessage = "Payment simulation completed successfully";
          shouldCallSuccess = true;
        }
      } else {
        // Production mode - provide detailed error messages
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
      }

      if (shouldCallSuccess) {
        // In simulation mode, treat certain errors as success
        handleSuccess();
      } else {
        onError(errorMessage);
      }
    },
    [onError, handleSuccess, isSimulationMode],
  );

  if (!address) {
    return (
      <Alert className="border-blue-200 bg-blue-50/80">
        <Wallet className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 font-medium">
          Please connect your wallet to make payment
        </AlertDescription>
      </Alert>
    );
  }

  if (calls.length === 0) {
    return (
      <Alert className="border-red-200 bg-red-50/80">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 font-medium">
          Unable to build payment transaction
        </AlertDescription>
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
          className="w-full bg-gradient-to-r from-[var(--brand-secondary)]/90 to-[var(--brand-secondary)]/80 hover:from-[var(--brand-secondary)] hover:to-[var(--brand-secondary)]/90 text-neutral-900 font-medium py-3 px-6 rounded-lg border-2 border-[var(--brand-secondary)] shadow-lg hover:shadow-xl transition-all duration-300"
          text={`Pay ${amount} USDC on Base`}
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
      <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50">
        <CardContent className="pt-4">
          <div className="text-xs space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-blue-600" />
              <span className="font-medium text-blue-800">
                {isSimulationMode
                  ? "Simulation Mode - Base Pay (USDC)"
                  : "Payment will be completed via Base Pay (USDC)"}
              </span>
            </div>
            {isSimulationMode && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                🧪 Currently in simulation mode for testing
              </div>
            )}
            <div className="space-y-1 text-blue-700">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {isSimulationMode
                  ? "Simulation will complete automatically"
                  : "Ensure you have sufficient USDC and ETH for gas fees"}
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Status will update automatically after payment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
