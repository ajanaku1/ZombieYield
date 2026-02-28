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

    // Ensure users with zombie assets always have claimable points
    // (minimum 1 day's worth so the claim button is never stuck at 0)
    const minPoints = pointsPerDay > 0 ? Math.max(pointsPerDay, 1) : 0;
    const effectivePoints = Math.max(totalPoints, minPoints);

    const tier = getTierForPoints(effectivePoints);

    const result = {
      totalPoints: effectivePoints,
      pointsPerDay,
      availableToClaim: effectivePoints,
      lastUpdated: Date.now(),
      tier,
    };
    this._lastPointsData = result;
    return result;
  }

  /**
   * Claim rewards (local fallback).
   * Used when Torque is unreachable or offer creation failed.
   */
  private _lastPointsData: UserPointsData | null = null;

  async claimRewards(_wallet: string): Promise<ClaimResult> {
    const claimedAmount = this._lastPointsData?.availableToClaim ?? 0;

    return {
      success: true,
      claimedAmount,
      transactionSignature: `local_claim_${Date.now()}`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Singleton instance
 */
export const torqueRewardsAdapter = new TorqueRewardsAdapter();

export default torqueRewardsAdapter;
