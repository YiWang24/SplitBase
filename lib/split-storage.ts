import { SplitBill, PaymentTransaction } from "./types";
import { redis } from "./redis";

/**
 * Split bill data storage management
 * Uses Redis as temporary storage, actual projects may need persistent database
 */

const BILL_PREFIX = "split_bill:";
const USER_BILLS_PREFIX = "user_bills:";
const TRANSACTION_PREFIX = "transaction:";

/**
 * Save split bill data
 */
export async function saveSplitBill(bill: SplitBill): Promise<void> {
  if (!redis) {
    console.error("Redis connection not available");
    throw new Error("Redis connection unavailable");
  }

  try {
    const key = `${BILL_PREFIX}${bill.id}`;
    await redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(bill)); // Expires in 7 days

    // Also update creator's split bill list
    await addBillToUserList(bill.creatorAddress, bill.id);

    console.log(`Saved split bill: ${bill.id}`);
  } catch (error) {
    console.error("Error saving split bill:", error);
    throw new Error("Failed to save split bill data");
  }
}

/**
 * Get split bill data
 */
export async function getSplitBill(billId: string): Promise<SplitBill | null> {
  if (!redis) {
    console.error("Redis connection not available");
    return null;
  }

  try {
    const key = `${BILL_PREFIX}${billId}`;
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    let bill: SplitBill;

    // Handle both string and object data from Redis
    if (typeof data === "string") {
      bill = JSON.parse(data) as SplitBill;
    } else if (typeof data === "object" && data !== null) {
      // Redis client already parsed the JSON, use it directly
      bill = data as SplitBill;
    } else {
      console.error("Redis returned invalid data type:", typeof data, data);
      return null;
    }

    // Convert date strings to Date objects
    bill.createdAt = new Date(bill.createdAt);
    bill.updatedAt = new Date(bill.updatedAt);
    bill.participants = bill.participants.map((p) => ({
      ...p,
      paidAt: p.paidAt ? new Date(p.paidAt) : undefined,
    }));

    return bill;
  } catch (error) {
    console.error("Error getting split bill:", error);
    return null;
  }
}

/**
 * Update split bill data
 */
export async function updateSplitBill(bill: SplitBill): Promise<void> {
  const existingBill = await getSplitBill(bill.id);
  if (!existingBill) {
    throw new Error("Split bill does not exist");
  }

  bill.updatedAt = new Date();
  await saveSplitBill(bill);
}

/**
 * Delete split bill data
 */
export async function deleteSplitBill(billId: string): Promise<void> {
  if (!redis) {
    console.error("Redis connection not available");
    throw new Error("Redis connection unavailable");
  }

  try {
    const bill = await getSplitBill(billId);
    if (bill) {
      // Remove from creator's bill list
      await removeBillFromUserList(bill.creatorAddress, billId);
    }

    const key = `${BILL_PREFIX}${billId}`;
    await redis.del(key);

    console.log(`Deleted split bill: ${billId}`);
  } catch (error) {
    console.error("Error deleting split bill:", error);
    throw new Error("Failed to delete split bill data");
  }
}

/**
 * Add split to user's list
 */
async function addBillToUserList(
  userAddress: string,
  billId: string,
): Promise<void> {
  if (!redis) {
    console.error("Redis connection not available for addBillToUserList");
    return;
  }

  try {
    const key = `${USER_BILLS_PREFIX}${userAddress.toLowerCase()}`;
    await redis.sadd(key, billId);
    await redis.expire(key, 30 * 24 * 60 * 60); // expire in 30 days
  } catch (error) {
    console.error("Error adding bill to user list:", error);
  }
}

/**
 * Remove split from user list
 */
async function removeBillFromUserList(
  userAddress: string,
  billId: string,
): Promise<void> {
  if (!redis) {
    console.error("Redis connection not available for removeBillFromUserList");
    return;
  }

  try {
    const key = `${USER_BILLS_PREFIX}${userAddress.toLowerCase()}`;
    await redis.srem(key, billId);
  } catch (error) {
    console.error("Error removing bill from user list:", error);
  }
}

/**
 * Get list of splits created by a user
 */
export async function getUserSplitBills(
  userAddress: string,
): Promise<SplitBill[]> {
  if (!redis) {
    console.error("Redis connection not available");
    return [];
  }

  try {
    const key = `${USER_BILLS_PREFIX}${userAddress.toLowerCase()}`;
    const billIds = await redis.smembers(key);

    const bills: SplitBill[] = [];
    for (const billId of billIds) {
      const bill = await getSplitBill(billId);
      if (bill) {
        bills.push(bill);
      }
    }

    // Sort by creation time (desc)
    return bills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error getting user split bills:", error);
    return [];
  }
}

/**
 * Save payment transaction
 */
export async function savePaymentTransaction(
  transaction: PaymentTransaction,
): Promise<void> {
  if (!redis) {
    console.error("Redis connection not available");
    throw new Error("Redis connection unavailable");
  }

  try {
    const key = `${TRANSACTION_PREFIX}${transaction.id}`;
    await redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(transaction)); // expire in 30 days

    console.log(`Saved payment transaction: ${transaction.id}`);
  } catch (error) {
    console.error("Error saving payment transaction:", error);
    throw new Error("Failed to save transaction record");
  }
}

/**
 * Get payment transaction
 */
export async function getPaymentTransaction(
  transactionId: string,
): Promise<PaymentTransaction | null> {
  if (!redis) {
    console.error("Redis connection not available");
    return null;
  }

  try {
    const key = `${TRANSACTION_PREFIX}${transactionId}`;
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    let transaction: PaymentTransaction;

    // Handle both string and object data from Redis
    if (typeof data === "string") {
      transaction = JSON.parse(data) as PaymentTransaction;
    } else if (typeof data === "object" && data !== null) {
      // Redis client already parsed the JSON, use it directly
      transaction = data as PaymentTransaction;
    } else {
      console.error(
        "Redis returned invalid data type for transaction:",
        typeof data,
        data,
      );
      return null;
    }

    // Convert date strings to Date objects
    transaction.createdAt = new Date(transaction.createdAt);
    if (transaction.confirmedAt) {
      transaction.confirmedAt = new Date(transaction.confirmedAt);
    }

    return transaction;
  } catch (error) {
    console.error("Error getting payment transaction:", error);
    return null;
  }
}

/**
 * Update payment transaction status
 */
export async function updatePaymentTransactionStatus(
  transactionId: string,
  status: "confirmed" | "failed",
  confirmedAt?: Date,
): Promise<void> {
  try {
    const transaction = await getPaymentTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction record does not exist");
    }

    transaction.status = status;
    if (confirmedAt) {
      transaction.confirmedAt = confirmedAt;
    }

    await savePaymentTransaction(transaction);
  } catch (error) {
    console.error("Error updating payment transaction status:", error);
    throw new Error("Failed to update transaction status");
  }
}

/**
 * Get all transactions for a split bill
 */
export async function getBillTransactions(
  billId: string,
): Promise<PaymentTransaction[]> {
  if (!redis) {
    console.error("Redis connection not available");
    return [];
  }

  try {
    // This is a simplified implementation; real projects may need better indexing
    // Currently scan all transactions to find related ones
    const pattern = `${TRANSACTION_PREFIX}*`;
    const keys = await redis.keys(pattern);

    const transactions: PaymentTransaction[] = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        let transaction: PaymentTransaction;

        if (typeof data === "string") {
          transaction = JSON.parse(data) as PaymentTransaction;
        } else if (typeof data === "object" && data !== null) {
          transaction = data as PaymentTransaction;
        } else {
          continue; // Skip invalid data
        }
        if (transaction.billId === billId) {
          transaction.createdAt = new Date(transaction.createdAt);
          if (transaction.confirmedAt) {
            transaction.confirmedAt = new Date(transaction.confirmedAt);
          }
          transactions.push(transaction);
        }
      }
    }

    return transactions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } catch (error) {
    console.error("Error getting bill transactions:", error);
    return [];
  }
}

/**
 * Cleanup expired data (can be called by a scheduled task)
 */
export async function cleanupExpiredData(): Promise<void> {
  try {
    // Redis automatically handles keys with TTL; this is mainly for logging
    console.log("Cleanup expired data task executed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

/**
 * Get statistics
 */
export async function getStats(): Promise<{
  totalBills: number;
  activeBills: number;
  completedBills: number;
  totalTransactions: number;
}> {
  if (!redis) {
    console.error("Redis connection not available");
    return {
      totalBills: 0,
      activeBills: 0,
      completedBills: 0,
      totalTransactions: 0,
    };
  }

  try {
    const billPattern = `${BILL_PREFIX}*`;
    const billKeys = await redis.keys(billPattern);

    let activeBills = 0;
    let completedBills = 0;

    for (const key of billKeys) {
      const data = await redis.get(key);
      if (data) {
        let bill: SplitBill;

        if (typeof data === "string") {
          bill = JSON.parse(data) as SplitBill;
        } else if (typeof data === "object" && data !== null) {
          bill = data as SplitBill;
        } else {
          continue; // Skip invalid data
        }
        if (bill.status === "active") {
          activeBills++;
        } else if (bill.status === "completed") {
          completedBills++;
        }
      }
    }

    const transactionPattern = `${TRANSACTION_PREFIX}*`;
    const transactionKeys = await redis.keys(transactionPattern);

    return {
      totalBills: billKeys.length,
      activeBills,
      completedBills,
      totalTransactions: transactionKeys.length,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      totalBills: 0,
      activeBills: 0,
      completedBills: 0,
      totalTransactions: 0,
    };
  }
}
