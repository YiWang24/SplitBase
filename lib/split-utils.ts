import {
  SplitBill,
  Participant,
  CreateSplitBillInput,
  BASE_PAY_CONFIG,
  SplitBillStats,
} from "./types";

/**
 * Generate unique split bill ID
 */
export function generateBillId(): string {
  return `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique participant ID
 */
export function generateParticipantId(): string {
  return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate amount per person
 */
export function calculateAmountPerPerson(
  totalAmount: string,
  participantCount: number,
): string {
  const total = parseFloat(totalAmount);
  const perPerson = total / participantCount;
  return perPerson.toFixed(6); // USDC 6 decimal places
}

/**
 * Validate split bill input data
 */
export function validateSplitBillInput(input: CreateSplitBillInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate title
  if (!input.title || input.title.trim().length === 0) {
    errors.push("Title cannot be empty");
  }

  if (input.title && input.title.length > 100) {
    errors.push("Title cannot exceed 100 characters");
  }

  // Validate total amount
  const totalAmount = parseFloat(input.totalAmount);
  if (isNaN(totalAmount) || totalAmount <= 0) {
    errors.push("Total amount must be a valid positive number");
  }

  if (totalAmount < parseFloat(BASE_PAY_CONFIG.MIN_AMOUNT)) {
    errors.push(
      `Total amount cannot be less than ${BASE_PAY_CONFIG.MIN_AMOUNT} USDC`,
    );
  }

  if (totalAmount > parseFloat(BASE_PAY_CONFIG.MAX_AMOUNT)) {
    errors.push(
      `Total amount cannot exceed ${BASE_PAY_CONFIG.MAX_AMOUNT} USDC`,
    );
  }

  // Validate creator address
  if (!input.creatorAddress || !isValidEthereumAddress(input.creatorAddress)) {
    errors.push("Invalid creator address");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Create a new split bill
 */
export function createSplitBill(input: CreateSplitBillInput): SplitBill {
  const validation = validateSplitBillInput(input);
  if (!validation.isValid) {
    throw new Error(`Failed to create split: ${validation.errors.join(", ")}`);
  }

  const billId = generateBillId();

  // Initially only creator, so amount per person equals total amount
  const initialParticipantCount = 1;
  const amountPerPerson = input.totalAmount;

  const bill: SplitBill = {
    id: billId,
    title: input.title.trim(),
    description: input.description?.trim(),
    totalAmount: input.totalAmount,
    currency: "USDC",
    participantCount: initialParticipantCount, // Start with 1 (creator only)
    amountPerPerson,
    creatorAddress: input.creatorAddress,
    creatorBasename: input.creatorBasename,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
    participants: [],
    shareUrl: generateShareUrl(billId),
  };

  // Add creator as a participant (status paid, since creator does not pay)
  const updatedBill = addCreatorAsParticipant(
    bill,
    input.creatorAddress,
    input.creatorBasename,
    input.creatorBasename || "Creator",
  );

  return updatedBill;
}

/**
 * Generate share URL
 */
export function generateShareUrl(billId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return `${baseUrl}/split/${billId}`;
}

/**
 * Add creator as a participant (status paid)
 */
export function addCreatorAsParticipant(
  bill: SplitBill,
  address: string,
  basename?: string,
  displayName?: string,
): SplitBill {
  // Check if already joined
  const existingParticipant = bill.participants.find(
    (p) => p.address.toLowerCase() === address.toLowerCase(),
  );
  if (existingParticipant) {
    throw new Error("This address has already joined this split");
  }

  // Validate address
  if (!isValidEthereumAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  const participant: Participant = {
    id: generateParticipantId(),
    address: address.toLowerCase(),
    basename,
    displayName:
      displayName ||
      basename ||
      `${address.slice(0, 6)}...${address.slice(-4)}`,
    amount: bill.amountPerPerson, // Use the current amount per person
    status: "paid", // Creator is marked as paid
  };

  const updatedBill: SplitBill = {
    ...bill,
    participants: [...bill.participants, participant],
    updatedAt: new Date(),
  };

  return updatedBill;
}

/**
 * Add participant to split
 */
export function addParticipant(
  bill: SplitBill,
  address: string,
  basename?: string,
  displayName?: string,
): SplitBill {
  // Check if already joined
  const existingParticipant = bill.participants.find(
    (p) => p.address.toLowerCase() === address.toLowerCase(),
  );
  if (existingParticipant) {
    throw new Error("This address has already joined this split");
  }

  // Validate address
  if (!isValidEthereumAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  // Calculate new participant count and amount per person
  const newParticipantCount = bill.participants.length + 1;
  const newAmountPerPerson = calculateAmountPerPerson(
    bill.totalAmount,
    newParticipantCount,
  );

  const participant: Participant = {
    id: generateParticipantId(),
    address: address.toLowerCase(),
    basename,
    displayName:
      displayName ||
      basename ||
      `${address.slice(0, 6)}...${address.slice(-4)}`,
    amount: newAmountPerPerson,
    status: "pending",
  };

  // Update all existing participants' amounts to the new per-person amount
  const updatedParticipants = bill.participants.map((p) => ({
    ...p,
    amount: newAmountPerPerson,
  }));

  const updatedBill: SplitBill = {
    ...bill,
    participantCount: newParticipantCount,
    amountPerPerson: newAmountPerPerson,
    participants: [...updatedParticipants, participant],
    updatedAt: new Date(),
  };

  return updatedBill;
}

/**
 * Update participant payment status
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
    throw new Error("Specified participant not found");
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

  // Check if everyone has paid (all participants including creator)
  const allPaid = updatedBill.participants.every(
    (p) => p.status === "paid" || p.status === "confirmed",
  );
  if (allPaid && updatedBill.participants.length >= 1) {
    updatedBill.status = "completed";
  }

  return updatedBill;
}

/**
 * Calculate split statistics
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

  // Use actual participant count for completion rate
  const actualParticipantCount = bill.participants.length;
  const completionRate =
    actualParticipantCount > 0
      ? (paidParticipants.length / actualParticipantCount) * 100
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
 * Format amount display
 */
export function formatAmount(amount: string, decimals: number = 2): string {
  const num = parseFloat(amount);
  return num.toFixed(decimals);
}

/**
 * Format address display
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
 * Convert USDC amount to wei (consider 6 decimals)
 */
export function usdcToWei(amount: string): bigint {
  const decimals = BASE_PAY_CONFIG.DECIMALS;
  const num = parseFloat(amount);
  return BigInt(Math.round(num * Math.pow(10, decimals)));
}

/**
 * Convert wei to USDC amount
 */
export function weiToUsdc(wei: bigint): string {
  const decimals = BASE_PAY_CONFIG.DECIMALS;
  const num = Number(wei) / Math.pow(10, decimals);
  return num.toFixed(6);
}

/**
 * Generate QR code data (share URL)
 */
export function generateQRCodeData(shareUrl: string): string {
  return shareUrl;
}

/**
 * Check if split can start collecting payments
 */
export function canStartCollection(bill: SplitBill): boolean {
  return bill.status === "active" && bill.participants.length >= 2;
}

/**
 * Check if a user can join the split
 */
export function canJoinBill(
  bill: SplitBill,
  userAddress: string,
): {
  canJoin: boolean;
  reason?: string;
} {
  if (bill.status !== "active") {
    return { canJoin: false, reason: "Split is closed" };
  }

  const isCreator =
    bill.creatorAddress.toLowerCase() === userAddress.toLowerCase();
  if (isCreator) {
    return { canJoin: false, reason: "Creator cannot join payment" };
  }

  const alreadyJoined = bill.participants.some(
    (p) => p.address.toLowerCase() === userAddress.toLowerCase(),
  );
  if (alreadyJoined) {
    return { canJoin: false, reason: "You have already joined this split" };
  }

  return { canJoin: true };
}
