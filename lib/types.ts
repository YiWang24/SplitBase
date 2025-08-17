// Core type definitions for split bill application

export interface SplitBill {
  id: string;
  title: string;
  description?: string;
  totalAmount: string; // Use string to store precise amount (USDC)
  currency: "USDC";
  participantCount: number;
  amountPerPerson: string; // Calculated amount per person
  creatorAddress: string;
  creatorBasename?: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "completed" | "cancelled";
  participants: Participant[];
  shareUrl?: string;
  qrCodeUrl?: string;
  nftReceiptId?: string; // NFT receipt ID
}

export interface Participant {
  id: string;
  address: string;
  basename?: string; // .base domain name
  displayName?: string;
  amount: string; // Amount to pay
  status: "pending" | "paid" | "confirmed";
  paidAt?: Date;
  transactionHash?: string;
}

export interface PaymentTransaction {
  id: string;
  billId: string;
  participantId: string;
  amount: string;
  currency: "USDC";
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: Date;
  confirmedAt?: Date;
}

// Input type for creating new split bill
export interface CreateSplitBillInput {
  title: string;
  description?: string;
  totalAmount: string;
  participantCount: number;
  creatorAddress: string;
  creatorBasename?: string;
}

// Input type for joining split bill
export interface JoinSplitBillInput {
  billId: string;
  participantAddress: string;
  participantBasename?: string;
  displayName?: string;
}

// Payment status update type
export interface PaymentStatusUpdate {
  participantId: string;
  status: "paid" | "confirmed";
  transactionHash?: string;
  paidAt?: Date;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Split bill statistics
export interface SplitBillStats {
  totalPaid: string;
  totalPending: string;
  paidParticipants: number;
  pendingParticipants: number;
  completionRate: number; // 0-100
}

// Mini App state management
export interface AppState {
  currentBill?: SplitBill;
  userParticipation?: Participant;
  isLoading: boolean;
  error?: string;
}

// Notification type
export interface NotificationPayload {
  type: "payment_received" | "bill_completed" | "payment_reminder";
  billId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// OnchainKit transaction related types
export interface USDCTransferCall {
  to: string; // Recipient address
  value: bigint; // USDC amount (in wei units)
  data: `0x${string}`; // Transfer call data
}

// Base Pay configuration
export const BASE_PAY_CONFIG = {
  USDC_CONTRACT_ADDRESS: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base mainnet USDC
  DECIMALS: 6, // USDC decimal places
  MIN_AMOUNT: "0.01", // Minimum split amount
  MAX_AMOUNT: "10000", // Maximum split amount
  MAX_PARTICIPANTS: 50, // Maximum participants
} as const;

// Utility function types
export type AmountFormatter = (amount: string) => string;
export type AddressFormatter = (address: string) => string;
