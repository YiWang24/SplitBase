import { Friend, AddFriendInput, UpdateFriendInput, SplitBill } from "./types";
import { redis } from "./redis";
import { Participant } from "./types";

// Storage key prefix for friends
const FRIENDS_REDIS_PREFIX = "friends:";

/**
 * Get friends from Redis for a specific address
 */
export async function getFriendsFromStorage(
  address: string,
): Promise<Friend[]> {
  console.log(
    `[getFriendsFromStorage] Attempting to get friends for address: ${address}`,
  );
  console.log(`[getFriendsFromStorage] Redis available: ${!!redis}`);

  if (!redis) {
    console.warn(
      `[getFriendsFromStorage] Redis not available, cannot get friends for ${address}`,
    );
    return [];
  }

  try {
    const redisKey = `${FRIENDS_REDIS_PREFIX}${address.toLowerCase()}`;
    console.log(`[getFriendsFromStorage] Redis key: ${redisKey}`);

    const stored = await redis.get(redisKey);
    console.log(`[getFriendsFromStorage] Redis get result:`, stored);

    if (stored) {
      const friends = stored as Friend[];
      console.log(
        `[getFriendsFromStorage] Retrieved ${friends.length} friends from Redis for ${address}`,
      );
      console.log(`[getFriendsFromStorage] Friends:`, friends);
      return friends;
    }

    console.log(
      `[getFriendsFromStorage] No friends found in Redis for ${address}`,
    );
    return [];
  } catch (error) {
    console.error("Error loading friends from storage:", error);
    return [];
  }
}

/**
 * Save friends to Redis for a specific address
 */
export async function saveFriendsToStorage(
  address: string,
  friends: Friend[],
): Promise<void> {
  try {
    if (redis) {
      const redisKey = `${FRIENDS_REDIS_PREFIX}${address.toLowerCase()}`;
      await redis.set(redisKey, friends, { ex: 60 * 60 * 24 * 30 }); // 30 days expiry
      console.log(
        `[saveFriendsToStorage] Saved ${friends.length} friends to Redis for ${address}`,
      );
    } else {
      console.warn(
        `[saveFriendsToStorage] Redis not available, cannot save friends for ${address}`,
      );
    }
  } catch (error) {
    console.error("Error saving friends to storage:", error);
    throw error; // Re-throw to handle errors properly
  }
}

/**
 * Add a new friend (async version with Redis support)
 */
export async function addFriendAsync(
  address: string,
  friendData: AddFriendInput,
): Promise<Friend> {
  console.log(
    `[addFriendAsync] Starting to add friend for address: ${address}`,
  );
  console.log(`[addFriendAsync] Friend data:`, friendData);

  const friends = await getFriendsFromStorage(address);
  console.log(`[addFriendAsync] Current friends count: ${friends.length}`);

  // Check if friend already exists to avoid duplicates
  const existingFriend = friends.find(
    (f) => f.address.toLowerCase() === friendData.address.toLowerCase(),
  );

  if (existingFriend) {
    console.log(
      `[addFriendAsync] Friend ${friendData.address} already exists for ${address}, skipping...`,
    );
    console.log(`[addFriendAsync] Existing friend:`, existingFriend);
    return existingFriend;
  }

  console.log(`[addFriendAsync] Creating new friend...`);
  const newFriend: Friend = {
    id: Date.now().toString(),
    address: friendData.address.toLowerCase(),
    basename: friendData.basename,
    nickname: friendData.basename || friendData.nickname, // 优先使用basename作为nickname
    addedAt: new Date(),
    isFavorite: false,
  };

  console.log(`[addFriendAsync] New friend object:`, newFriend);

  const updatedFriends = [...friends, newFriend];
  console.log(
    `[addFriendAsync] Updated friends array length: ${updatedFriends.length}`,
  );

  await saveFriendsToStorage(address, updatedFriends);
  console.log(`[addFriendAsync] Successfully saved to storage`);

  console.log(
    `[addFriendAsync] Successfully added friend ${friendData.address} for ${address}`,
  );

  return newFriend;
}

/**
 * Update an existing friend
 */
export async function updateFriend(
  address: string,
  friendId: string,
  updates: Partial<UpdateFriendInput>,
): Promise<Friend | null> {
  const friends = await getFriendsFromStorage(address);
  const friendIndex = friends.findIndex((f) => f.id === friendId);

  if (friendIndex === -1) return null;

  const updatedFriend = { ...friends[friendIndex], ...updates };
  friends[friendIndex] = updatedFriend;

  await saveFriendsToStorage(address, friends);

  return updatedFriend;
}

/**
 * Delete a friend
 */
export async function deleteFriend(
  address: string,
  friendId: string,
): Promise<boolean> {
  const friends = await getFriendsFromStorage(address);
  const updatedFriends = friends.filter((f) => f.id !== friendId);

  if (updatedFriends.length === friends.length) {
    return false; // Friend not found
  }

  await saveFriendsToStorage(address, updatedFriends);
  return true;
}

/**
 * Toggle favorite status of a friend
 */
export async function toggleFriendFavorite(
  address: string,
  friendId: string,
): Promise<Friend | null> {
  const friends = await getFriendsFromStorage(address);
  const friendIndex = friends.findIndex((f) => f.id === friendId);

  if (friendIndex === -1) return null;

  friends[friendIndex].isFavorite = !friends[friendIndex].isFavorite;
  await saveFriendsToStorage(address, friends);

  return friends[friendIndex];
}

/**
 * Search friends by various criteria
 */
export function searchFriends(friends: Friend[], searchTerm: string): Friend[] {
  if (!searchTerm.trim()) return friends;

  const term = searchTerm.toLowerCase();
  return friends.filter(
    (friend) =>
      friend.address.toLowerCase().includes(term) ||
      friend.nickname?.toLowerCase().includes(term) ||
      friend.basename?.toLowerCase().includes(term),
  );
}

/**
 * Get friends sorted by favorite status and name
 */
export function getSortedFriends(friends: Friend[]): Friend[] {
  return [...friends].sort((a, b) => {
    // First sort by favorite status
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;

    // Then sort by nickname or address
    const aName = a.nickname || a.address;
    const bName = b.nickname || b.address;

    return aName.localeCompare(bName);
  });
}

/**
 * Check if an address is already in friends list
 */
export async function isAddressInFriends(
  address: string,
  userAddress: string,
): Promise<boolean> {
  const friends = await getFriendsFromStorage(userAddress);
  return friends.some(
    (friend) => friend.address.toLowerCase() === address.toLowerCase(),
  );
}

/**
 * Get friend by address
 */
export async function getFriendByAddress(
  address: string,
  userAddress: string,
): Promise<Friend | null> {
  const friends = await getFriendsFromStorage(userAddress);
  return (
    friends.find(
      (friend) => friend.address.toLowerCase() === address.toLowerCase(),
    ) || null
  );
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format address for display
 */
export function formatAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4,
): string {
  if (address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Get display name for a friend (prioritizes nickname, then formatted address)
 */
export function getFriendDisplayName(friend: Friend): string {
  return friend.nickname || formatAddress(friend.address);
}

/**
 * Update last used timestamp for a friend
 */
export async function updateFriendLastUsed(
  address: string,
  friendId: string,
): Promise<void> {
  const friends = await getFriendsFromStorage(address);
  const friendIndex = friends.findIndex((f) => f.id === friendId);

  if (friendIndex !== -1) {
    friends[friendIndex].lastUsedAt = new Date();
    await saveFriendsToStorage(address, friends);
  }
}

/**
 * Get friends sorted by intimacy score (favorites first, then by interaction frequency)
 */
export function getFriendsByIntimacy(friends: Friend[]): Friend[] {
  return [...friends].sort((a, b) => {
    // First sort by favorite status
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;

    // Then sort by intimacy score (you can extend this logic based on your needs)
    // For now, we'll use a simple scoring system
    const getIntimacyScore = (friend: Friend) => {
      let score = 0;

      // Favorite friends get bonus points
      if (friend.isFavorite) score += 100;

      // Friends with nicknames get bonus points (more personal)
      if (friend.nickname) score += 50;

      // Friends with .base domains get bonus points (more established)
      if (friend.basename) score += 30;

      // Add points based on when they were added (newer friends get slight bonus)
      if (friend.addedAt) {
        const daysSinceAdded = Math.floor(
          (Date.now() - new Date(friend.addedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        score += Math.max(0, 20 - daysSinceAdded); // Newer friends get up to 20 points
      }

      return score;
    };

    const scoreA = getIntimacyScore(a);
    const scoreB = getIntimacyScore(b);

    // Higher score first
    if (scoreB !== scoreA) return scoreB - scoreA;

    // If scores are equal, sort by nickname or address
    const aName = a.nickname || a.address;
    const bName = b.nickname || b.address;
    return aName.localeCompare(bName);
  });
}

/**
 * Get top friends by intimacy score (top N friends)
 */
export function getTopFriends(friends: Friend[], limit: number = 5): Friend[] {
  return getFriendsByIntimacy(friends).slice(0, limit);
}

/**
 * Manage friend relationships for all participants in a split bill
 * When someone joins, everyone in the bill becomes friends with each other
 */
export async function manageFriendRelationships(
  bill: SplitBill,
  newParticipantAddress: string,
): Promise<void> {
  console.log(`[manageFriendRelationships] Starting for bill: ${bill.id}`);
  console.log(
    `[manageFriendRelationships] New participant: ${newParticipantAddress}`,
  );
  console.log(
    `[manageFriendRelationships] Total participants: ${bill.participants.length}`,
  );

  // Debug: Log all participants
  console.log(
    `[manageFriendRelationships] All participants:`,
    bill.participants.map((p) => ({
      address: p.address,
      basename: p.basename,
      displayName: p.displayName,
    })),
  );

  const allParticipants = bill.participants;
  const newParticipantAddressLower = newParticipantAddress.toLowerCase();

  console.log(
    `[manageFriendRelationships] New participant address (lowercase): ${newParticipantAddressLower}`,
  );

  // Get the new participant's info
  const newParticipant = allParticipants.find(
    (p: Participant) => p.address.toLowerCase() === newParticipantAddressLower,
  );

  if (!newParticipant) {
    console.error(
      `[manageFriendRelationships] ERROR: New participant not found in bill!`,
    );
    console.error(
      `[manageFriendRelationships] Searched for: ${newParticipantAddressLower}`,
    );
    console.error(
      `[manageFriendRelationships] Available addresses:`,
      allParticipants.map((p) => p.address.toLowerCase()),
    );
    throw new Error("New participant not found in bill");
  }

  console.log(`[manageFriendRelationships] Found new participant:`, {
    address: newParticipant.address,
    basename: newParticipant.basename,
    displayName: newParticipant.displayName,
  });

  // Track success/failure counts
  let totalProcessed = 0;
  let successfulAdds = 0;
  let skippedDuplicates = 0;
  let errors = 0;

  // For each existing participant (excluding the new one), add the new participant as friend
  for (const participant of allParticipants) {
    const participantAddressLower = participant.address.toLowerCase();

    if (participantAddressLower !== newParticipantAddressLower) {
      totalProcessed++;
      console.log(
        `[manageFriendRelationships] Processing participant ${totalProcessed}/${allParticipants.length - 1}: ${participant.address} (${participantAddressLower})`,
      );

      try {
        // Check if they're already friends to avoid duplicates
        console.log(
          `[manageFriendRelationships] Checking if ${participantAddressLower} already has ${newParticipantAddressLower} as friend...`,
        );
        const isAlreadyFriend = await isAddressInFriends(
          newParticipantAddressLower,
          participantAddressLower,
        );

        console.log(
          `[manageFriendRelationships] ${participant.address} already has ${newParticipantAddress} as friend: ${isAlreadyFriend}`,
        );

        if (!isAlreadyFriend) {
          // Add new participant as friend to existing participant
          console.log(
            `[manageFriendRelationships] Adding ${newParticipantAddress} as friend to ${participant.address}`,
          );
          const addedFriend = await addFriendAsync(participantAddressLower, {
            address: newParticipantAddressLower,
            basename: newParticipant.basename,
            nickname: newParticipant.address || newParticipant.displayName, // 优先使用basename
          });
          console.log(
            `[manageFriendRelationships] Successfully added friend:`,
            addedFriend,
          );
          successfulAdds++;
        } else {
          console.log(`[manageFriendRelationships] Skipping - already friends`);
          skippedDuplicates++;
        }

        // Check if new participant already has this person as friend
        console.log(
          `[manageFriendRelationships] Checking if ${newParticipantAddressLower} already has ${participantAddressLower} as friend...`,
        );
        const isNewParticipantAlreadyFriend = await isAddressInFriends(
          participantAddressLower,
          newParticipantAddressLower,
        );

        console.log(
          `[manageFriendRelationships] ${newParticipantAddress} already has ${participant.address} as friend: ${isNewParticipantAlreadyFriend}`,
        );

        if (!isNewParticipantAlreadyFriend) {
          // Add existing participant as friend to new participant
          console.log(
            `[manageFriendRelationships] Adding ${participant.address} as friend to ${newParticipantAddress}`,
          );
          const addedFriend = await addFriendAsync(newParticipantAddressLower, {
            address: participantAddressLower,
            basename: participant.basename,
            nickname: participant.address || participant.displayName, // 优先使用basename
          });
          console.log(
            `[manageFriendRelationships] Successfully added friend:`,
            addedFriend,
          );
          successfulAdds++;
        } else {
          console.log(`[manageFriendRelationships] Skipping - already friends`);
          skippedDuplicates++;
        }
      } catch (error) {
        console.error(
          `[manageFriendRelationships] Error processing participant ${participant.address}:`,
          error,
        );
        errors++;
        // Continue with other participants even if one fails
      }
    } else {
      console.log(
        `[manageFriendRelationships] Skipping new participant (same address)`,
      );
    }
  }

  console.log(`[manageFriendRelationships] Completed for bill: ${bill.id}`);
  console.log(`[manageFriendRelationships] Summary:`);
  console.log(`  - Total participants processed: ${totalProcessed}`);
  console.log(`  - Successful friend additions: ${successfulAdds}`);
  console.log(`  - Skipped duplicates: ${skippedDuplicates}`);
  console.log(`  - Errors encountered: ${errors}`);
}
