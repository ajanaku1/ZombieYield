/**
 * ZombieYield Type Definitions
 */

// --- Asset Classification ---

export type AssetCategory = 'dust_token' | 'dormant_token' | 'abandoned_nft' | 'dead_project';

export interface ZombieScore {
  base: number;
  balanceMultiplier: number;
  dormancyBonus: number;
  categoryRate: number;
  total: number;
}

// --- Asset Types ---

export interface ZombieToken {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
}

export interface ZombieNFT {
  mint: string;
  collectionName: string;
  name: string;
  image?: string;
}

export interface ZombieAsset {
  type: 'token' | 'nft';
  mint: string;
  name: string;
  symbol?: string;
  balance?: number;
  status: 'undead' | 'active' | 'claimed';
  category?: AssetCategory;
  zombieScore?: ZombieScore;
  usdValue?: number;
  lastActivityDaysAgo?: number;
}

// --- Points & Rewards ---

export interface PointsData {
  totalZombieAssets: number;
  pointsPerDay: number;
  totalPointsAccumulated: number;
  lastUpdated: number;
}

export interface ClaimHistoryEntry {
  id: string;
  walletAddress: string;
  pointsClaimed: number;
  timestamp: number;
  txSignature?: string;
  offerId?: string;
  offerName?: string;
  claimType: 'points' | 'torque_offer';
}

// --- Torque ---

export interface TorqueUserProfile {
  pubkey: string;
  twitter?: string;
  discord?: string;
  totalOffersCompleted: number;
}

// --- App State ---

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  shortAddress: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
