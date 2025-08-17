import { SplitBill, Participant, PaymentTransaction } from "./types";
import { redis } from "./redis";

/**
 * 分账数据存储管理
 * 使用 Redis 作为临时存储，实际项目中可能需要持久化数据库
 */

const BILL_PREFIX = "split_bill:";
const USER_BILLS_PREFIX = "user_bills:";
const TRANSACTION_PREFIX = "transaction:";

/**
 * 保存分账数据
 */
export async function saveSplitBill(bill: SplitBill): Promise<void> {
  try {
    const key = `${BILL_PREFIX}${bill.id}`;
    await redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(bill)); // 7天过期

    // 同时更新创建者的分账列表
    await addBillToUserList(bill.creatorAddress, bill.id);

    console.log(`Saved split bill: ${bill.id}`);
  } catch (error) {
    console.error("Error saving split bill:", error);
    throw new Error("保存分账数据失败");
  }
}

/**
 * 获取分账数据
 */
export async function getSplitBill(billId: string): Promise<SplitBill | null> {
  try {
    const key = `${BILL_PREFIX}${billId}`;
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    const bill = JSON.parse(data) as SplitBill;

    // 转换日期字符串为 Date 对象
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
 * 更新分账数据
 */
export async function updateSplitBill(bill: SplitBill): Promise<void> {
  const existingBill = await getSplitBill(bill.id);
  if (!existingBill) {
    throw new Error("分账不存在");
  }

  bill.updatedAt = new Date();
  await saveSplitBill(bill);
}

/**
 * 删除分账数据
 */
export async function deleteSplitBill(billId: string): Promise<void> {
  try {
    const bill = await getSplitBill(billId);
    if (bill) {
      // 从创建者的分账列表中移除
      await removeBillFromUserList(bill.creatorAddress, billId);
    }

    const key = `${BILL_PREFIX}${billId}`;
    await redis.del(key);

    console.log(`Deleted split bill: ${billId}`);
  } catch (error) {
    console.error("Error deleting split bill:", error);
    throw new Error("删除分账数据失败");
  }
}

/**
 * 添加分账到用户列表
 */
async function addBillToUserList(
  userAddress: string,
  billId: string,
): Promise<void> {
  try {
    const key = `${USER_BILLS_PREFIX}${userAddress.toLowerCase()}`;
    await redis.sadd(key, billId);
    await redis.expire(key, 30 * 24 * 60 * 60); // 30天过期
  } catch (error) {
    console.error("Error adding bill to user list:", error);
  }
}

/**
 * 从用户列表移除分账
 */
async function removeBillFromUserList(
  userAddress: string,
  billId: string,
): Promise<void> {
  try {
    const key = `${USER_BILLS_PREFIX}${userAddress.toLowerCase()}`;
    await redis.srem(key, billId);
  } catch (error) {
    console.error("Error removing bill from user list:", error);
  }
}

/**
 * 获取用户创建的分账列表
 */
export async function getUserSplitBills(
  userAddress: string,
): Promise<SplitBill[]> {
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

    // 按创建时间降序排序
    return bills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error getting user split bills:", error);
    return [];
  }
}

/**
 * 保存支付交易记录
 */
export async function savePaymentTransaction(
  transaction: PaymentTransaction,
): Promise<void> {
  try {
    const key = `${TRANSACTION_PREFIX}${transaction.id}`;
    await redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(transaction)); // 30天过期

    console.log(`Saved payment transaction: ${transaction.id}`);
  } catch (error) {
    console.error("Error saving payment transaction:", error);
    throw new Error("保存交易记录失败");
  }
}

/**
 * 获取支付交易记录
 */
export async function getPaymentTransaction(
  transactionId: string,
): Promise<PaymentTransaction | null> {
  try {
    const key = `${TRANSACTION_PREFIX}${transactionId}`;
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    const transaction = JSON.parse(data) as PaymentTransaction;

    // 转换日期字符串为 Date 对象
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
 * 更新支付交易状态
 */
export async function updatePaymentTransactionStatus(
  transactionId: string,
  status: "confirmed" | "failed",
  confirmedAt?: Date,
): Promise<void> {
  try {
    const transaction = await getPaymentTransaction(transactionId);
    if (!transaction) {
      throw new Error("交易记录不存在");
    }

    transaction.status = status;
    if (confirmedAt) {
      transaction.confirmedAt = confirmedAt;
    }

    await savePaymentTransaction(transaction);
  } catch (error) {
    console.error("Error updating payment transaction status:", error);
    throw new Error("更新交易状态失败");
  }
}

/**
 * 获取分账的所有交易记录
 */
export async function getBillTransactions(
  billId: string,
): Promise<PaymentTransaction[]> {
  try {
    // 这是一个简化实现，实际项目中可能需要更复杂的索引
    // 目前通过扫描所有交易记录来查找相关交易
    const pattern = `${TRANSACTION_PREFIX}*`;
    const keys = await redis.keys(pattern);

    const transactions: PaymentTransaction[] = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const transaction = JSON.parse(data) as PaymentTransaction;
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
 * 清理过期数据 (可以通过定时任务调用)
 */
export async function cleanupExpiredData(): Promise<void> {
  try {
    // Redis 会自动处理带有过期时间的键，这里主要是记录日志
    console.log("Cleanup expired data task executed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

/**
 * 获取统计信息
 */
export async function getStats(): Promise<{
  totalBills: number;
  activeBills: number;
  completedBills: number;
  totalTransactions: number;
}> {
  try {
    const billPattern = `${BILL_PREFIX}*`;
    const billKeys = await redis.keys(billPattern);

    let activeBills = 0;
    let completedBills = 0;

    for (const key of billKeys) {
      const data = await redis.get(key);
      if (data) {
        const bill = JSON.parse(data) as SplitBill;
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
