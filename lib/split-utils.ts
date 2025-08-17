import {
  SplitBill,
  Participant,
  CreateSplitBillInput,
  BASE_PAY_CONFIG,
  SplitBillStats,
} from "./types";

/**
 * 生成唯一的分账 ID
 */
export function generateBillId(): string {
  return `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成唯一的参与者 ID
 */
export function generateParticipantId(): string {
  return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 计算每人应付金额
 */
export function calculateAmountPerPerson(
  totalAmount: string,
  participantCount: number,
): string {
  const total = parseFloat(totalAmount);
  const perPerson = total / participantCount;
  return perPerson.toFixed(6); // USDC 6位小数
}

/**
 * 验证分账输入数据
 */
export function validateSplitBillInput(input: CreateSplitBillInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证标题
  if (!input.title || input.title.trim().length === 0) {
    errors.push("标题不能为空");
  }

  if (input.title && input.title.length > 100) {
    errors.push("标题不能超过100个字符");
  }

  // 验证总金额
  const totalAmount = parseFloat(input.totalAmount);
  if (isNaN(totalAmount) || totalAmount <= 0) {
    errors.push("总金额必须是有效的正数");
  }

  if (totalAmount < parseFloat(BASE_PAY_CONFIG.MIN_AMOUNT)) {
    errors.push(`总金额不能少于 ${BASE_PAY_CONFIG.MIN_AMOUNT} USDC`);
  }

  if (totalAmount > parseFloat(BASE_PAY_CONFIG.MAX_AMOUNT)) {
    errors.push(`总金额不能超过 ${BASE_PAY_CONFIG.MAX_AMOUNT} USDC`);
  }

  // 验证参与人数
  if (!Number.isInteger(input.participantCount) || input.participantCount < 2) {
    errors.push("参与人数至少为2人");
  }

  if (input.participantCount > BASE_PAY_CONFIG.MAX_PARTICIPANTS) {
    errors.push(`参与人数不能超过 ${BASE_PAY_CONFIG.MAX_PARTICIPANTS} 人`);
  }

  // 验证创建者地址
  if (!input.creatorAddress || !isValidEthereumAddress(input.creatorAddress)) {
    errors.push("创建者地址无效");
  }

  // 验证每人金额是否合理
  const amountPerPerson = parseFloat(
    calculateAmountPerPerson(input.totalAmount, input.participantCount),
  );
  if (amountPerPerson < parseFloat(BASE_PAY_CONFIG.MIN_AMOUNT)) {
    errors.push(
      `每人金额 ${amountPerPerson.toFixed(6)} USDC 低于最小限额 ${BASE_PAY_CONFIG.MIN_AMOUNT} USDC`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证以太坊地址格式
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * 创建新的分账
 */
export function createSplitBill(input: CreateSplitBillInput): SplitBill {
  const validation = validateSplitBillInput(input);
  if (!validation.isValid) {
    throw new Error(`创建分账失败: ${validation.errors.join(", ")}`);
  }

  const billId = generateBillId();
  const amountPerPerson = calculateAmountPerPerson(
    input.totalAmount,
    input.participantCount,
  );

  const bill: SplitBill = {
    id: billId,
    title: input.title.trim(),
    description: input.description?.trim(),
    totalAmount: input.totalAmount,
    currency: "USDC",
    participantCount: input.participantCount,
    amountPerPerson,
    creatorAddress: input.creatorAddress,
    creatorBasename: input.creatorBasename,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
    participants: [],
    shareUrl: generateShareUrl(billId),
  };

  return bill;
}

/**
 * 生成分享链接
 */
export function generateShareUrl(billId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return `${baseUrl}/split/${billId}`;
}

/**
 * 添加参与者到分账
 */
export function addParticipant(
  bill: SplitBill,
  address: string,
  basename?: string,
  displayName?: string,
): SplitBill {
  // 检查是否已经参与
  const existingParticipant = bill.participants.find(
    (p) => p.address.toLowerCase() === address.toLowerCase(),
  );
  if (existingParticipant) {
    throw new Error("该地址已参与此分账");
  }

  // 检查是否已满
  if (bill.participants.length >= bill.participantCount) {
    throw new Error("分账已满，无法添加更多参与者");
  }

  // 验证地址
  if (!isValidEthereumAddress(address)) {
    throw new Error("无效的以太坊地址");
  }

  const participant: Participant = {
    id: generateParticipantId(),
    address: address.toLowerCase(),
    basename,
    displayName:
      displayName ||
      basename ||
      `${address.slice(0, 6)}...${address.slice(-4)}`,
    amount: bill.amountPerPerson,
    status: "pending",
  };

  const updatedBill: SplitBill = {
    ...bill,
    participants: [...bill.participants, participant],
    updatedAt: new Date(),
  };

  return updatedBill;
}

/**
 * 更新参与者支付状态
 */
export function updateParticipantPayment(
  bill: SplitBill,
  participantId: string,
  transactionHash: string,
  status: "paid" | "confirmed" = "paid",
): SplitBill {
  const participantIndex = bill.participants.findIndex(
    (p) => p.id === participantId,
  );
  if (participantIndex === -1) {
    throw new Error("未找到指定参与者");
  }

  const updatedParticipants = [...bill.participants];
  updatedParticipants[participantIndex] = {
    ...updatedParticipants[participantIndex],
    status,
    transactionHash,
    paidAt: new Date(),
  };

  const updatedBill: SplitBill = {
    ...bill,
    participants: updatedParticipants,
    updatedAt: new Date(),
  };

  // 检查是否所有人都已支付
  const allPaid = updatedBill.participants.every(
    (p) => p.status === "paid" || p.status === "confirmed",
  );
  if (
    allPaid &&
    updatedBill.participants.length === updatedBill.participantCount
  ) {
    updatedBill.status = "completed";
  }

  return updatedBill;
}

/**
 * 计算分账统计信息
 */
export function calculateBillStats(bill: SplitBill): SplitBillStats {
  const paidParticipants = bill.participants.filter(
    (p) => p.status === "paid" || p.status === "confirmed",
  );
  const pendingParticipants = bill.participants.filter(
    (p) => p.status === "pending",
  );

  const totalPaid = paidParticipants.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0,
  );
  const totalPending = pendingParticipants.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0,
  );

  const completionRate =
    bill.participantCount > 0
      ? (paidParticipants.length / bill.participantCount) * 100
      : 0;

  return {
    totalPaid: totalPaid.toFixed(6),
    totalPending: totalPending.toFixed(6),
    paidParticipants: paidParticipants.length,
    pendingParticipants: pendingParticipants.length,
    completionRate: Math.round(completionRate),
  };
}

/**
 * 格式化金额显示
 */
export function formatAmount(amount: string, decimals: number = 2): string {
  const num = parseFloat(amount);
  return num.toFixed(decimals);
}

/**
 * 格式化地址显示
 */
export function formatAddress(
  address: string,
  start: number = 6,
  end: number = 4,
): string {
  if (address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * 将 USDC 金额转换为 wei (考虑 6 位小数)
 */
export function usdcToWei(amount: string): bigint {
  const decimals = BASE_PAY_CONFIG.DECIMALS;
  const num = parseFloat(amount);
  return BigInt(Math.round(num * Math.pow(10, decimals)));
}

/**
 * 将 wei 转换为 USDC 金额
 */
export function weiToUsdc(wei: bigint): string {
  const decimals = BASE_PAY_CONFIG.DECIMALS;
  const num = Number(wei) / Math.pow(10, decimals);
  return num.toFixed(6);
}

/**
 * 生成二维码数据 (分享链接)
 */
export function generateQRCodeData(shareUrl: string): string {
  return shareUrl;
}

/**
 * 检查分账是否可以开始收款
 */
export function canStartCollection(bill: SplitBill): boolean {
  return bill.status === "active" && bill.participants.length >= 2;
}

/**
 * 检查用户是否可以加入分账
 */
export function canJoinBill(
  bill: SplitBill,
  userAddress: string,
): {
  canJoin: boolean;
  reason?: string;
} {
  if (bill.status !== "active") {
    return { canJoin: false, reason: "分账已关闭" };
  }

  if (bill.participants.length >= bill.participantCount) {
    return { canJoin: false, reason: "分账已满" };
  }

  const isCreator =
    bill.creatorAddress.toLowerCase() === userAddress.toLowerCase();
  if (isCreator) {
    return { canJoin: false, reason: "创建者不能参与支付" };
  }

  const alreadyJoined = bill.participants.some(
    (p) => p.address.toLowerCase() === userAddress.toLowerCase(),
  );
  if (alreadyJoined) {
    return { canJoin: false, reason: "您已参与此分账" };
  }

  return { canJoin: true };
}
