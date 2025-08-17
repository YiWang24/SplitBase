// 分账应用的核心类型定义

export interface SplitBill {
  id: string;
  title: string;
  description?: string;
  totalAmount: string; // 使用字符串存储精确金额 (USDC)
  currency: "USDC";
  participantCount: number;
  amountPerPerson: string; // 计算得出的每人金额
  creatorAddress: string;
  creatorBasename?: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "completed" | "cancelled";
  participants: Participant[];
  shareUrl?: string;
  qrCodeUrl?: string;
  nftReceiptId?: string; // NFT 收据 ID
}

export interface Participant {
  id: string;
  address: string;
  basename?: string; // .base 域名
  displayName?: string;
  amount: string; // 应付金额
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

// 用于创建新分账的输入类型
export interface CreateSplitBillInput {
  title: string;
  description?: string;
  totalAmount: string;
  participantCount: number;
  creatorAddress: string;
  creatorBasename?: string;
}

// 用于加入分账的输入类型
export interface JoinSplitBillInput {
  billId: string;
  participantAddress: string;
  participantBasename?: string;
  displayName?: string;
}

// 支付状态更新类型
export interface PaymentStatusUpdate {
  participantId: string;
  status: "paid" | "confirmed";
  transactionHash?: string;
  paidAt?: Date;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分账统计信息
export interface SplitBillStats {
  totalPaid: string;
  totalPending: string;
  paidParticipants: number;
  pendingParticipants: number;
  completionRate: number; // 0-100
}

// Mini App 状态管理
export interface AppState {
  currentBill?: SplitBill;
  userParticipation?: Participant;
  isLoading: boolean;
  error?: string;
}

// 通知类型
export interface NotificationPayload {
  type: "payment_received" | "bill_completed" | "payment_reminder";
  billId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// OnchainKit 交易相关类型
export interface USDCTransferCall {
  to: string; // 接收方地址
  value: bigint; // USDC 金额 (以 wei 为单位)
  data: `0x${string}`; // 转账调用数据
}

// Base Pay 配置
export const BASE_PAY_CONFIG = {
  USDC_CONTRACT_ADDRESS: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base 主网 USDC
  DECIMALS: 6, // USDC 小数位数
  MIN_AMOUNT: "0.01", // 最小分账金额
  MAX_AMOUNT: "10000", // 最大分账金额
  MAX_PARTICIPANTS: 50, // 最大参与人数
} as const;

// 工具函数类型
export type AmountFormatter = (amount: string) => string;
export type AddressFormatter = (address: string) => string;
