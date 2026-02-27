/**
 * Rewards Adapter Interface
 *
 * Abstract interface for rewards system integration.
 * This abstraction allows easy swapping between mock and real Torque implementation.
 *
 * @module lib/rewards/rewardsAdapter
 */

/**
 * User points data returned from adapter
 */
export interface UserPointsData {
  totalPoints: number;
  pointsPerDay: number;
  availableToClaim: number;
  lastUpdated: number;
  tier?: string;
}

/**
 * Claim result after successful claim
 */
export interface ClaimResult {
  success: boolean;
  claimedAmount: number;
  transactionSignature?: string;
  timestamp: number;
}

/**
 * Rewards Adapter Interface
 *
 * This interface defines the contract for any rewards implementation.
 * Implementations can use mock data, Torque API, or any other backend.
 */
export interface RewardsAdapter {
  /**
   * Get user's current points balance
   *
   * @param wallet - User's wallet address
   * @param zombieCount - Number of zombie assets held (for calculation)
   * @param walletConnectedAt - When wallet was connected (for time-based calc)
   * @returns User points data
   */
  getUserPoints(
    wallet: string,
    zombieCount: number,
    walletConnectedAt: number
  ): Promise<UserPointsData>;

  /**
   * Claim accumulated rewards
   *
   * @param wallet - User's wallet address
   * @returns Claim result with transaction info
   */
  claimRewards(wallet: string): Promise<ClaimResult>;

  /**
   * Check if adapter is properly configured
   *
   * @returns true if adapter can function
   */
  isConfigured(): boolean;

  /**
   * Get adapter name for debugging
   *
   * @returns Adapter identifier
   */
  getAdapterName(): string;
}
