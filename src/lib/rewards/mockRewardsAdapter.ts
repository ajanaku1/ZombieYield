/**
 * Mock Rewards Adapter
 *
 * Local mock implementation for development and testing.
 * Uses the points engine for calculations and simulates API delays.
 *
 * @module lib/rewards/mockRewardsAdapter
 */

import type { RewardsAdapter, UserPointsData, ClaimResult } from './rewardsAdapter';
import { calculatePoints, getTierForPoints } from '../pointsEngine';

/**
 * In-memory store for claimed points (simulates blockchain)
 */
const claimedPointsStore = new Map<string, number>();

/**
 * Mock Rewards Adapter Implementation
 */
export class MockRewardsAdapter implements RewardsAdapter {
  /**
   * Get user's current points balance
   */
  async getUserPoints(
    wallet: string,
    zombieCount: number,
    walletConnectedAt: number
  ): Promise<UserPointsData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Calculate points using engine
    const { pointsPerDay, totalPoints } = calculatePoints(
      zombieCount,
      walletConnectedAt
    );

    // Get previously claimed amount
    const claimed = claimedPointsStore.get(wallet.toLowerCase()) || 0;

    // Available = total - claimed
    const availableToClaim = Math.max(0, totalPoints - claimed);

    // Determine tier
    const tier = getTierForPoints(totalPoints);

    return {
      totalPoints,
      pointsPerDay,
      availableToClaim,
      lastUpdated: Date.now(),
      tier,
    };
  }

  /**
   * Claim accumulated rewards (simulated)
   */
  async claimRewards(wallet: string): Promise<ClaimResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get current points
    const currentClaimed = claimedPointsStore.get(wallet.toLowerCase()) || 0;

    // For mock, we just track that claim happened
    // In real implementation, this would interact with Torque/smart contract
    const mockClaimAmount = 100; // Simulated claim amount
    claimedPointsStore.set(wallet.toLowerCase(), currentClaimed + mockClaimAmount);

    return {
      success: true,
      claimedAmount: mockClaimAmount,
      transactionSignature: `mock_tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Mock adapter is always configured
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Get adapter name
   */
  getAdapterName(): string {
    return 'MockRewardsAdapter';
  }
}

/**
 * Singleton instance
 */
export const mockRewardsAdapter = new MockRewardsAdapter();

export default mockRewardsAdapter;
