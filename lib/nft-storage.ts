// NFT Storage utilities for Redis

import { redis } from "./redis";
import { NFTData, NFTCreationResult } from "./nft-types";

// Temporary in-memory storage as fallback when Redis is not available
const memoryStorage = new Map<string, NFTData>();
const userNftLists = new Map<string, Set<string>>();

export class NFTStorageError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "NFTStorageError";
  }
}

// Generate unique NFT ID
export function generateNFTId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `nft_${timestamp}_${random}`;
}

// Store NFT data in Redis
export async function storeNFT(nftData: NFTData): Promise<NFTCreationResult> {
  if (!redis) {
    throw new NFTStorageError("Redis not available", "REDIS_UNAVAILABLE");
  }

  try {
    const userId = nftData.userId || "anonymous";
    const nftKey = `nft:${userId}:${nftData.id}`;
    const userNftsKey = `user_nfts:${userId}`;

    // Store NFT data
    await redis.set(nftKey, JSON.stringify(nftData));

    // Add to user's NFT list
    await redis.sadd(userNftsKey, nftData.id);

    // Add to global NFT list for admin purposes
    await redis.sadd("all_nfts", nftData.id);

    // Set expiration (optional - 1 year)
    await redis.expire(nftKey, 365 * 24 * 60 * 60);

    return {
      success: true,
      nftId: nftData.id,
    };
  } catch (error) {
    console.error("Error storing NFT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Retrieve NFT by ID
export async function getNFT(
  nftId: string,
  userId?: string,
): Promise<NFTData | null> {
  if (!redis) {
    throw new NFTStorageError("Redis not available", "REDIS_UNAVAILABLE");
  }

  try {
    const userIdToUse = userId || "anonymous";
    const nftKey = `nft:${userIdToUse}:${nftId}`;

    const nftDataString = await redis.get(nftKey);
    if (!nftDataString) {
      return null;
    }

    // Handle different data types
    if (typeof nftDataString === "string") {
      // If it's a string, try to parse as JSON
      return JSON.parse(nftDataString) as NFTData;
    } else if (typeof nftDataString === "object" && nftDataString !== null) {
      // If it's already an object, use it directly
      return nftDataString as NFTData;
    } else {
      console.error(
        `Unexpected data type for ${nftKey}:`,
        typeof nftDataString,
      );
      return null;
    }
  } catch (error) {
    console.error("Error retrieving NFT:", error);
    throw new NFTStorageError("Failed to retrieve NFT", "RETRIEVAL_ERROR");
  }
}

// Get all NFTs for a user
export async function getUserNFTs(userId?: string): Promise<NFTData[]> {
  const userIdToUse = userId || "anonymous";

  // Try Redis first, fallback to memory storage
  if (redis) {
    try {
      console.log(`Getting NFTs from Redis for user: ${userIdToUse}`);
      const userNftsKey = `user_nfts:${userIdToUse}`;

      // Get all NFT IDs for the user
      const nftIds = (await redis.smembers(userNftsKey)) as string[];
      console.log(`Found ${nftIds.length} NFT IDs for user ${userIdToUse}`);

      if (!nftIds || nftIds.length === 0) {
        return [];
      }

      // Retrieve all NFT data
      const nftPromises = nftIds.map(async (nftId: string) => {
        const nftKey = `nft:${userIdToUse}:${nftId}`;
        const nftDataString = await redis!.get(nftKey);
        if (!nftDataString) {
          console.warn(`NFT data not found for key: ${nftKey}`);
          return null;
        }

        // Debug: Log the raw data
        console.log(`Raw NFT data for ${nftKey}:`, nftDataString);
        console.log(`Data type: ${typeof nftDataString}`);

        try {
          let parsedData: NFTData;

          // Handle different data types
          if (typeof nftDataString === "string") {
            // If it's a string, try to parse as JSON
            parsedData = JSON.parse(nftDataString);
          } else if (
            typeof nftDataString === "object" &&
            nftDataString !== null
          ) {
            // If it's already an object, use it directly
            parsedData = nftDataString as NFTData;
          } else {
            console.error(
              `Unexpected data type for ${nftKey}:`,
              typeof nftDataString,
            );
            return null;
          }

          console.log(`Successfully processed NFT data for ${nftKey}:`, {
            id: parsedData.id,
            title: parsedData.metadata?.title,
            type: typeof parsedData,
          });
          return parsedData;
        } catch (parseError) {
          console.error(
            `Failed to process NFT data for key: ${nftKey}:`,
            parseError,
          );
          console.error(`Raw data that failed to process:`, nftDataString);
          return null;
        }
      });

      const nfts = await Promise.all(nftPromises);
      const validNfts = nfts.filter((nft): nft is NFTData => nft !== null);

      console.log(
        `Retrieved ${validNfts.length} valid NFTs out of ${nftIds.length} IDs from Redis`,
      );

      // Sort by creation date (newest first)
      return validNfts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Redis error, falling back to memory storage:", error);
    }
  }

  // Fallback to memory storage
  console.log(`Getting NFTs from memory storage for user: ${userIdToUse}`);
  const userNftSet = userNftLists.get(userIdToUse);
  if (!userNftSet || userNftSet.size === 0) {
    return [];
  }

  const nfts: NFTData[] = [];
  for (const nftId of userNftSet) {
    const nft = memoryStorage.get(nftId);
    if (nft) {
      nfts.push(nft);
    }
  }

  console.log(
    `Retrieved ${nfts.length} NFTs from memory storage for user ${userIdToUse}`,
  );

  // Sort by creation date (newest first)
  return nfts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// Delete NFT
export async function deleteNFT(
  nftId: string,
  userId?: string,
): Promise<boolean> {
  if (!redis) {
    throw new NFTStorageError("Redis not available", "REDIS_UNAVAILABLE");
  }

  try {
    const userIdToUse = userId || "anonymous";
    const nftKey = `nft:${userIdToUse}:${nftId}`;
    const userNftsKey = `user_nfts:${userIdToUse}`;

    // Remove NFT data
    await redis.del(nftKey);

    // Remove from user's NFT list
    await redis.srem(userNftsKey, nftId);

    // Remove from global NFT list
    await redis.srem("all_nfts", nftId);

    return true;
  } catch (error) {
    console.error("Error deleting NFT:", error);
    return false;
  }
}

// Get NFT count for user
export async function getUserNFTCount(userId?: string): Promise<number> {
  if (!redis) {
    return 0;
  }

  try {
    const userIdToUse = userId || "anonymous";
    const userNftsKey = `user_nfts:${userIdToUse}`;

    return await redis.scard(userNftsKey);
  } catch (error) {
    console.error("Error getting NFT count:", error);
    return 0;
  }
}

// Check if NFT exists for a bill
export async function getNFTByBillId(
  billId: string,
  userId?: string,
): Promise<NFTData | null> {
  if (!redis) {
    return null;
  }

  try {
    const userNfts = await getUserNFTs(userId);
    return userNfts.find((nft) => nft.billId === billId) || null;
  } catch (error) {
    console.error("Error checking NFT by bill ID:", error);
    return null;
  }
}
