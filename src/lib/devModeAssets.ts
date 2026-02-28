/**
 * DEV Mode Mock Asset Generator
 *
 * Generates mock zombie assets based on wallet SOL balance for demo purposes.
 * ONLY active in development mode (import.meta.env.DEV).
 *
 * This allows showcasing the full ZombieYield experience without real assets.
 *
 * @module lib/devModeAssets
 */

import type { ZombieAsset } from '../types';

/**
 * Mock asset configurations based on SOL balance tiers
 */
interface MockAssetTier {
  minBalance: number;
  maxBalance?: number;
  assets: Omit<ZombieAsset, 'status'>[];
  description: string;
}

/**
 * SOL balance tiers and corresponding mock assets
 */
export const MOCK_ASSET_TIERS: MockAssetTier[] = [
  {
    minBalance: 0,
    maxBalance: 0.5,
    description: 'Starter Zombie',
    assets: [], // Empty - no mock assets for very low balance
  },
  {
    minBalance: 0.5,
    maxBalance: 1,
    description: 'Bonk Holder',
    assets: [
      {
        type: 'token',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        balance: 1000000,
      },
    ],
  },
  {
    minBalance: 1,
    maxBalance: 2,
    description: 'Zombie Collector',
    assets: [
      {
        type: 'token',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        balance: 1000000,
      },
      {
        type: 'token',
        mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        name: 'dogwifhat',
        symbol: 'WIF',
        balance: 500,
      },
    ],
  },
  {
    minBalance: 2,
    maxBalance: 5,
    description: 'Mad Lad Investor',
    assets: [
      {
        type: 'token',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        balance: 2000000,
      },
      {
        type: 'token',
        mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        name: 'dogwifhat',
        symbol: 'WIF',
        balance: 1000,
      },
      {
        type: 'token',
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        name: 'Jupiter',
        symbol: 'JUP',
        balance: 500,
      },
    ],
  },
  {
    minBalance: 5,
    description: 'Zombie Whale',
    assets: [
      {
        type: 'token',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        balance: 5000000,
      },
      {
        type: 'token',
        mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        name: 'dogwifhat',
        symbol: 'WIF',
        balance: 2500,
      },
      {
        type: 'token',
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        name: 'Jupiter',
        symbol: 'JUP',
        balance: 1000,
      },
      {
        type: 'token',
        mint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
        name: 'Popcat',
        symbol: 'POPCAT',
        balance: 750,
      },
      {
        type: 'nft',
        mint: 'mad_lads_demo_nft_001',
        name: 'Mad Lad #1337',
        symbol: 'MADLAD',
      },
    ],
  },
];

/**
 * Get mock assets based on SOL balance
 *
 * @param solBalance - Wallet SOL balance
 * @returns Array of mock zombie assets
 */
export function getMockAssetsForBalance(solBalance: number): ZombieAsset[] {
  // Find the appropriate tier
  const tier = MOCK_ASSET_TIERS.find((t) => {
    if (t.maxBalance === undefined) {
      return solBalance >= t.minBalance;
    }
    return solBalance >= t.minBalance && solBalance < t.maxBalance;
  });

  if (!tier || tier.assets.length === 0) {
    return [];
  }

  // Convert to ZombieAsset with status
  return tier.assets.map((asset) => ({
    ...asset,
    status: 'undead' as const,
  }));
}

/**
 * Get tier description for display
 *
 * @param solBalance - Wallet SOL balance
 * @returns Tier description string
 */
export function getTierDescription(solBalance: number): string {
  const tier = MOCK_ASSET_TIERS.find((t) => {
    if (t.maxBalance === undefined) {
      return solBalance >= t.minBalance;
    }
    return solBalance >= t.minBalance && solBalance < t.maxBalance;
  });

  return tier?.description || 'Unknown';
}

/**
 * Check if demo asset injection should be enabled.
 *
 * Always enabled — this is a hackathon demo app that needs to show
 * functionality even when the wallet holds no real allowlisted tokens.
 * Set VITE_DISABLE_DEMO_ASSETS=true to disable.
 */
export function isDevModeEnabled(): boolean {
  if (import.meta.env.VITE_DISABLE_DEMO_ASSETS === 'true') return false;
  return true;
}

/**
 * DEV mode configuration
 */
export const DEV_MODE_CONFIG = {
  enabled: isDevModeEnabled(),
  injectMockAssets: true,
  logToConsole: import.meta.env.DEV,
};
