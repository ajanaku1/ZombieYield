/**
 * ZombieYield Type Definitions
 */

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
}

export interface PointsData {
  totalZombieAssets: number;
  pointsPerDay: number;
  totalPointsAccumulated: number;
  lastUpdated: number;
}

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
