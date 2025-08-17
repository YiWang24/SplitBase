import { Friend, AddFriendInput, UpdateFriendInput } from "./types";
import { redis } from "./redis";

// Storage key prefix for friends
const FRIENDS_STORAGE_PREFIX = "friends_";
const FRIENDS_REDIS_PREFIX = "friends:";

/**
 * Get friends from Redis or localStorage for a specific address
 */
export async function getFriendsFromStorage(
  address: string,
): Promise<Friend[]> {
  try {
    // Try Redis first
    if (redis) {
      const redisKey = `${FRIENDS_REDIS_PREFIX}${address}`;
      const stored = await redis.get(redisKey);
      if (stored) {
        return stored as Friend[];
      }
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(`${FRIENDS_STORAGE_PREFIX}${address}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading friends from storage:", error);
  }
  return [];
}

/**
 * Get friends from localStorage (synchronous version for backward compatibility)
 */
export function getFriendsFromStorageSync(address: string): Friend[] {
  try {
    const stored = localStorage.getItem(`${FRIENDS_STORAGE_PREFIX}${address}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading friends from storage:", error);
  }
  return [];
}

/**
 * Save friends to Redis and localStorage for a specific address
 */
export async function saveFriendsToStorage(
  address: string,
  friends: Friend[],
): Promise<void> {
  try {
    // Save to Redis first
    if (redis) {
      const redisKey = `${FRIENDS_REDIS_PREFIX}${address}`;
      await redis.set(redisKey, friends, { ex: 60 * 60 * 24 * 30 }); // 30 days expiry
    }

    // Also save to localStorage as backup
    localStorage.setItem(
      `${FRIENDS_STORAGE_PREFIX}${address}`,
      JSON.stringify(friends),
    );
  } catch (error) {
    console.error("Error saving friends to storage:", error);
  }
}

/**
 * Save friends to localStorage (synchronous version for backward compatibility)
 */
export function saveFriendsToStorageSync(
  address: string,
  friends: Friend[],
): void {
  try {
    localStorage.setItem(
      `${FRIENDS_STORAGE_PREFIX}${address}`,
      JSON.stringify(friends),
    );
  } catch (error) {
    console.error("Error saving friends to storage:", error);
  }
}

/**
 * Add a new friend
 */
export function addFriend(address: string, friendData: AddFriendInput): Friend {
  const friends = getFriendsFromStorageSync(address);

  const newFriend: Friend = {
    id: Date.now().toString(),
    address: friendData.address,
    basename: friendData.basename,
    nickname: friendData.nickname,
    addedAt: new Date(),
    isFavorite: false,
  };

  const updatedFriends = [...friends, newFriend];
  saveFriendsToStorageSync(address, updatedFriends);

  return newFriend;
}

/**
 * Add a new friend (async version with Redis support)
 */
export async function addFriendAsync(
  address: string,
  friendData: AddFriendInput,
): Promise<Friend> {
  const friends = await getFriendsFromStorage(address);

  const newFriend: Friend = {
    id: Date.now().toString(),
    address: friendData.address,
    basename: friendData.basename,
    nickname: friendData.nickname,
    addedAt: new Date(),
    isFavorite: false,
  };

  const updatedFriends = [...friends, newFriend];
  await saveFriendsToStorage(address, updatedFriends);

  return newFriend;
}

/**
 * Update an existing friend
 */
export function updateFriend(
  address: string,
  friendId: string,
  updates: Partial<UpdateFriendInput>,
): Friend | null {
  const friends = getFriendsFromStorageSync(address);
  const friendIndex = friends.findIndex((f) => f.id === friendId);

  if (friendIndex === -1) return null;

  const updatedFriend = { ...friends[friendIndex], ...updates };
  friends[friendIndex] = updatedFriend;

  saveFriendsToStorageSync(address, friends);

  return updatedFriend;
}

/**
 * Delete a friend
 */
export function deleteFriend(address: string, friendId: string): boolean {
  const friends = getFriendsFromStorageSync(address);
  const updatedFriends = friends.filter((f) => f.id !== friendId);

  if (updatedFriends.length === friends.length) {
    return false; // Friend not found
  }

  saveFriendsToStorageSync(address, updatedFriends);
  return true;
}

/**
 * Toggle favorite status of a friend
 */
export function toggleFriendFavorite(
  address: string,
  friendId: string,
): Friend | null {
  const friends = getFriendsFromStorageSync(address);
  const friendIndex = friends.findIndex((f) => f.id === friendId);

  if (friendIndex === -1) return null;

  friends[friendIndex].isFavorite = !friends[friendIndex].isFavorite;
  saveFriendsToStorageSync(address, friends);

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
export function isAddressInFriends(
  address: string,
  userAddress: string,
): boolean {
  const friends = getFriendsFromStorageSync(userAddress);
  return friends.some(
    (friend) => friend.address.toLowerCase() === address.toLowerCase(),
  );
}

/**
 * Get friend by address
 */
export function getFriendByAddress(
  address: string,
  userAddress: string,
): Friend | null {
  const friends = getFriendsFromStorageSync(userAddress);
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
export function updateFriendLastUsed(address: string, friendId: string): void {
  const friends = getFriendsFromStorageSync(address);
  const friendIndex = friends.findIndex((f) => f.id === friendId);

  if (friendIndex !== -1) {
    friends[friendIndex].lastUsedAt = new Date();
    saveFriendsToStorageSync(address, friends);
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
