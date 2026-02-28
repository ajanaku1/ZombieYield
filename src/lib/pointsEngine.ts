/**
 * ZombieYield Points Engine
 *
 * Category-aware points system with zombie scoring.
 * Pure logic module - no React dependencies.
 *
 * Features:
 * - Category-based point rates (dust, dormant, abandoned NFT, dead project)
 * - Balance-weighted scoring with log scale
 * - Dormancy bonus for long-idle assets
 * - Time-based accumulation
 * - Deterministic calculations
 *
 * @module lib/pointsEngine
 */

import type { ZombieAsset, ZombieScore, AssetCategory } from '../types';

/**
 * Points calculation result
 */
export interface PointsResult {
  pointsPerDay: number;
  totalPoints: number;
  multiplier: number;
  daysActive: number;
  lastUpdated: number;
}

/**
 * Points configuration
 */
export interface PointsConfig {
  basePointsPerAsset: number;
  multiplier: number;
}

/**
 * Default configuration (fallback for uncategorized assets)
 */
export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  basePointsPerAsset: 10,
  multiplier: 1,
};

/**
 * Category-based point rates per day
 */
export const CATEGORY_RATES: Record<AssetCategory, number> = {
  dust_token: 5,
  dormant_token: 15,
  abandoned_nft: 20,
  dead_project: 25,
};

/**
 * Calculate zombie score for an individual asset
 */
export function calculateZombieScore(asset: ZombieAsset): ZombieScore {
  const categoryRate = asset.category ? CATEGORY_RATES[asset.category] : 10;

  // Balance multiplier: log2(balance + 1) clamped to [1, 5]
  // 1 token → 1x, 100 → ~2.2x, 10K → ~4.6x, 100K+ → 5x cap
  const balance = asset.balance ?? 1;
  const rawBalanceMult = Math.log2(balance + 1);
  const balanceMultiplier = Math.min(Math.max(rawBalanceMult, 1), 5);

  // Dormancy bonus: +0.5x per 30 days idle, up to +3x
  const dormancyDays = asset.lastActivityDaysAgo ?? 0;
  const dormancyBonus = Math.min((dormancyDays / 30) * 0.5, 3);

  const base = categoryRate;
  const total = Math.round(base * balanceMultiplier * (1 + dormancyBonus));

  return { base, balanceMultiplier, dormancyBonus, categoryRate, total };
}

/**
 * Calculate total points per day for a set of zombie assets
 */
export function calculatePointsPerDayFromAssets(assets: ZombieAsset[]): number {
  return assets.reduce((sum, asset) => {
    const score = asset.zombieScore ?? calculateZombieScore(asset);
    return sum + score.total;
  }, 0);
}

/**
 * Calculate points based on zombie count and connection time
 * Falls back to flat rate when assets aren't provided
 */
export function calculatePoints(
  zombieCount: number,
  walletConnectedAt: number,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): PointsResult {
  const pointsPerDay = zombieCount * config.basePointsPerAsset * config.multiplier;
  const now = Date.now();
  const elapsedMs = Math.max(0, now - walletConnectedAt);
  const daysActive = elapsedMs / (1000 * 60 * 60 * 24);
  const totalPoints = Math.floor(pointsPerDay * daysActive);

  return {
    pointsPerDay,
    totalPoints,
    multiplier: config.multiplier,
    daysActive: Math.min(daysActive, 365),
    lastUpdated: now,
  };
}

/**
 * Calculate points with category-aware scoring
 */
export function calculatePointsFromAssets(
  assets: ZombieAsset[],
  walletConnectedAt: number
): PointsResult {
  const pointsPerDay = calculatePointsPerDayFromAssets(assets);
  const now = Date.now();
  const elapsedMs = Math.max(0, now - walletConnectedAt);
  const daysActive = elapsedMs / (1000 * 60 * 60 * 24);
  const totalPoints = Math.floor(pointsPerDay * daysActive);

  return {
    pointsPerDay,
    totalPoints,
    multiplier: 1,
    daysActive: Math.min(daysActive, 365),
    lastUpdated: now,
  };
}

/**
 * Calculate points for a specific time period
 *
 * @param pointsPerDay - Daily points rate
 * @param days - Number of days to calculate for
 * @returns Total points for the period
 */
export function calculatePointsForPeriod(
  pointsPerDay: number,
  days: number
): number {
  return Math.floor(pointsPerDay * days);
}

/**
 * Format points for display with K/M suffixes
 *
 * @param points - Raw points number
 * @returns Formatted string (e.g., "1.5K", "2.3M")
 */
export function formatPoints(points: number): string {
  if (points >= 1_000_000) {
    return `${(points / 1_000_000).toFixed(2)}M`;
  }
  if (points >= 1_000) {
    return `${(points / 1_000).toFixed(1)}K`;
  }
  return points.toLocaleString();
}

/**
 * Calculate estimated time to next reward threshold
 *
 * @param currentPoints - Current total points
 * @param pointsPerDay - Daily points rate
 * @param threshold - Target points threshold
 * @returns Days until threshold (0 if already reached)
 */
export function calculateTimeToThreshold(
  currentPoints: number,
  pointsPerDay: number,
  threshold: number
): number {
  if (currentPoints >= threshold || pointsPerDay <= 0) {
    return 0;
  }
  const remaining = threshold - currentPoints;
  return Math.ceil(remaining / pointsPerDay);
}

/**
 * Mock Torque API response structure
 * For easy integration with real Torque API later
 */
export interface TorquePointsResponse {
  success: boolean;
  data: {
    walletAddress: string;
    pointsPerDay: number;
    totalPoints: number;
    multiplier: number;
    tier: string;
    lastUpdated: number;
  };
  timestamp: number;
}

/**
 * Simulate Torque API call
 * Replace with actual Torque API integration in production
 *
 * @param walletAddress - User's wallet address
 * @param zombieCount - Number of zombie assets
 * @param walletConnectedAt - Connection timestamp
 * @param config - Points configuration
 * @returns Mock Torque API response
 */
export async function mockFetchTorquePoints(
  walletAddress: string,
  zombieCount: number,
  walletConnectedAt: number,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): Promise<TorquePointsResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { pointsPerDay, totalPoints, multiplier } = calculatePoints(
    zombieCount,
    walletConnectedAt,
    config
  );

  // Determine tier based on points
  let tier = 'Rookie';
  if (totalPoints >= 10000) tier = 'Veteran';
  if (totalPoints >= 50000) tier = 'Elite';
  if (totalPoints >= 100000) tier = 'Legend';

  return {
    success: true,
    data: {
      walletAddress,
      pointsPerDay,
      totalPoints,
      multiplier,
      tier,
      lastUpdated: Date.now(),
    },
    timestamp: Date.now(),
  };
}

/**
 * Engine mode indicator
 * Switch to 'torque' when real integration is ready
 */
export const ENGINE_MODE: 'mock' | 'torque' = 'mock';

/**
 * Get current engine mode
 */
export function getEngineMode(): 'mock' | 'torque' {
  return ENGINE_MODE;
}

/**
 * Points tier definitions
 */
export const POINTS_TIERS = [
  { name: 'Rookie', minPoints: 0, color: '#9ca3af' },
  { name: 'Veteran', minPoints: 10_000, color: '#39ff14' },
  { name: 'Elite', minPoints: 50_000, color: '#00bfff' },
  { name: 'Legend', minPoints: 100_000, color: '#ffd700' },
];

/**
 * Get tier name for a given points total
 *
 * @param totalPoints - Total accumulated points
 * @returns Tier name
 */
export function getTierForPoints(totalPoints: number): string {
  for (let i = POINTS_TIERS.length - 1; i >= 0; i--) {
    if (totalPoints >= POINTS_TIERS[i].minPoints) {
      return POINTS_TIERS[i].name;
    }
  }
  return 'Rookie';
}

/**
 * Get tier color for UI
 *
 * @param totalPoints - Total accumulated points
 * @returns Tier color hex
 */
export function getTierColor(totalPoints: number): string {
  for (let i = POINTS_TIERS.length - 1; i >= 0; i--) {
    if (totalPoints >= POINTS_TIERS[i].minPoints) {
      return POINTS_TIERS[i].color;
    }
  }
  return POINTS_TIERS[0].color;
}
