/**
 * ZombieYield Points Engine
 *
 * Torque-compatible mock points system.
 * Pure logic module - no React dependencies.
 *
 * Features:
 * - Configurable base points per asset
 * - Multiplier support for future enhancements
 * - Time-based accumulation
 * - Deterministic calculations
 *
 * @module lib/pointsEngine
 */

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
 * Easy to override for different point schemes
 */
export interface PointsConfig {
  basePointsPerAsset: number;
  multiplier: number;
}

/**
 * Default configuration
 * MVP uses 10 points per asset per day
 */
export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  basePointsPerAsset: 10,
  multiplier: 1,
};

/**
 * Calculate points based on zombie count and connection time
 *
 * @param zombieCount - Number of zombie assets held
 * @param walletConnectedAt - Timestamp when wallet was connected (ms)
 * @param config - Optional points configuration
 * @returns Points calculation result
 */
export function calculatePoints(
  zombieCount: number,
  walletConnectedAt: number,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): PointsResult {
  // Points per day = base points × asset count × multiplier
  const pointsPerDay = zombieCount * config.basePointsPerAsset * config.multiplier;

  // Calculate time elapsed since connection
  const now = Date.now();
  const elapsedMs = Math.max(0, now - walletConnectedAt);

  // Convert to days (with decimal precision)
  const daysActive = elapsedMs / (1000 * 60 * 60 * 24);

  // Calculate total points accumulated over time
  const totalPoints = Math.floor(pointsPerDay * daysActive);

  return {
    pointsPerDay,
    totalPoints,
    multiplier: config.multiplier,
    daysActive: Math.min(daysActive, 365), // Cap at 1 year for display
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
