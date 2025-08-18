// NFT Data Types and Interfaces

import { LocationType, TimeOfDayType, RarityLevel } from "./nft-generation";

export interface NFTMetadata {
  title: string;
  participants: string[];
  totalAmount: number;
  location: LocationType;
  timeOfDay: TimeOfDayType;
  participantCount: number;
  amountPerPerson: number;
  rarity: RarityLevel;
  locationDisplayName: string;
  timeDisplayName: string;
}

export interface NFTData {
  id: string;
  billId: string;
  userId?: string;
  imageData: string; // Base64 encoded image
  metadata: NFTMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface NFTGenerationParams {
  participants: string[];
  location: LocationType;
  timeOfDay: TimeOfDayType;
  totalAmount: number;
  billId: string;
  billTitle: string;
}

export interface NFTCreationResult {
  success: boolean;
  nftId?: string;
  error?: string;
}

// Redis storage patterns
export const NFT_REDIS_KEYS = {
  nft: (userId: string, nftId: string) => `nft:${userId}:${nftId}`,
  userNfts: (userId: string) => `user_nfts:${userId}`,
  allNfts: "all_nfts",
} as const;
