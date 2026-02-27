/**
 * Torque Rewards Adapter
 *
 * Thin wrapper that delegates to the Torque SDK (@torque-labs/react).
 * The real Torque integration is handled via TorqueProvider and React hooks
 * (useTorque, useOffers, useStartOffer, useOfferJourney).
 *
 * This adapter implements the RewardsAdapter interface for backward compatibility
 * with the points/claim system, using local calculation as a fallback since
 * the SDK handles the real offer lifecycle through React context.
 *
 * @module lib/rewards/torqueRewardsAdapter
 */

import type { RewardsAdapter, UserPointsData, ClaimResult } from './rewardsAdapter';
import { calculatePoints, getTierForPoints } from '../pointsEngine';

/**
 * Torque Rewards Adapter — SDK-backed implementation
 *
 * Points/claims still use local calculation since the real Torque SDK
 * works through React hooks (useOffers, useStartOffer, useOfferJourney)
 * which handle offer acceptance and journey tracking natively.
 */
export class TorqueRewardsAdapter implements RewardsAdapter {
  /**
   * The SDK is always "configured" — auth happens via wallet SIWS in TorqueProvider.
   * No API key needed.
   */
  isConfigured(): boolean {
    return true;
  }

  getAdapterName(): string {
    return 'TorqueSDK';
  }

  /**
   * Get user's current points (local calculation).
   * The Torque SDK handles real offer rewards via its own hooks.
   */
  async getUserPoints(
    _wallet: string,
    zombieCount: number,
    walletConnectedAt: number
  ): Promise<UserPointsData> {
    const { pointsPerDay, totalPoints } = calculatePoints(
      zombieCount,
      walletConnectedAt
    );

    const tier = getTierForPoints(totalPoints);

    return {
      totalPoints,
      pointsPerDay,
      availableToClaim: totalPoints,
      lastUpdated: Date.now(),
      tier,
    };
  }

  /**
   * Claim rewards.
   * In the real flow, claiming is handled by Torque journey completion.
   * This provides a local fallback for the existing claim UI.
   */
  async claimRewards(_wallet: string): Promise<ClaimResult> {
    // Simulate — real claims go through Torque offer journeys
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      claimedAmount: 0,
      transactionSignature: `torque_sdk_${Date.now()}`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Singleton instance
 */
export const torqueRewardsAdapter = new TorqueRewardsAdapter();

export default torqueRewardsAdapter;
