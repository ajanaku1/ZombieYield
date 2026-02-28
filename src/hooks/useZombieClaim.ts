/**
 * useZombieClaim Hook
 *
 * Wires the ZombieYield claim flow through Torque SDK.
 * Finds or creates a ZombieYield-specific offer, then routes claims
 * through Torque's journey system. Falls back to local claims if
 * Torque is unavailable.
 *
 * @module hooks/useZombieClaim
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useTorque,
  useOffers,
  useStartOffer,
  useOfferAction,
  useOfferJourney,
  useCreateOffer,
} from '@torque-labs/react';
import { rewardsClient } from '../lib/rewards';
import { useAppStore } from '../store/appStore';
import type { ClaimResult } from '../lib/rewards/rewardsAdapter';

const ZOMBIE_OFFER_TITLE = 'ZombieYield Daily Claim';

export function useZombieClaim() {
  const { isAuthenticated } = useTorque();
  const { torqueClaimOfferId, setTorqueClaimOfferId } = useAppStore();

  const [offerId, setOfferId] = useState<string | null>(torqueClaimOfferId);
  const [isTorqueClaim, setIsTorqueClaim] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const setupAttempted = useRef(false);

  // Fetch active offers to find our ZombieYield offer
  const {
    data: offers,
    isLoading: offersLoading,
  } = useOffers({
    status: 'ACTIVE',
    enabled: isAuthenticated,
  });

  // Create offer mutation
  const createOfferMutation = useCreateOffer({
    onSuccess: (data) => {
      console.log('[ZombieClaim] Created ZombieYield offer:', data.id);
      setOfferId(data.id);
      setTorqueClaimOfferId(data.id);
      setIsTorqueClaim(true);
      setFallbackReason(null);
    },
    onError: (error) => {
      console.warn('[ZombieClaim] Failed to create offer:', error.message);
      setIsTorqueClaim(false);
      setFallbackReason(`Offer creation failed: ${error.message}`);
    },
  });

  // Start offer mutation
  const { mutateAsync: startOfferAsync } = useStartOffer();

  // Offer action (for executing the claim)
  const { executeAction } = useOfferAction({
    offerId: offerId ?? '',
    index: 0,
    enabled: isAuthenticated && !!offerId,
    onSuccess: (signature) => {
      console.log('[ZombieClaim] Claim action executed:', signature);
    },
    onError: (error) => {
      console.warn('[ZombieClaim] Claim action failed:', error.message);
    },
  });

  // Journey tracking
  const {
    data: journeyData,
    refetch: refetchJourney,
  } = useOfferJourney({
    offerId: offerId ?? '',
    enabled: isAuthenticated && !!offerId,
  });

  const journey = journeyData?.[0] ?? null;
  const journeyStatus = journey?.status ?? null;

  // Find or create the ZombieYield offer
  useEffect(() => {
    if (!isAuthenticated || offersLoading || setupAttempted.current) return;

    // If we already have a cached offer ID, verify it still exists
    if (torqueClaimOfferId && offers) {
      const found = offers.find((o) => o.id === torqueClaimOfferId);
      if (found) {
        setOfferId(torqueClaimOfferId);
        setIsTorqueClaim(true);
        return;
      }
      // Cached ID is stale
      setTorqueClaimOfferId(null);
    }

    // Search by title
    if (offers) {
      const zombieOffer = offers.find(
        (o) => o.metadata?.title?.includes('ZombieYield')
      );

      if (zombieOffer) {
        setOfferId(zombieOffer.id);
        setTorqueClaimOfferId(zombieOffer.id);
        setIsTorqueClaim(true);
        return;
      }

      // No existing offer found — try to create one
      setupAttempted.current = true;

      const now = new Date();
      const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      createOfferMutation.mutate({
        metadata: {
          title: ZOMBIE_OFFER_TITLE,
          description: 'Claim daily rewards from your zombie Solana assets. Powered by Torque.',
        },
        startTime: now,
        endTime: oneYearFromNow,
        requirements: [{
          type: 'CLAIM' as any,
          config: {
            claim: { type: 'boolean' as const, exact: true },
          },
          oracle: 'CUSTOM_EVENT_PROVIDER' as const,
        }],
      } as any);
    }
  }, [isAuthenticated, offers, offersLoading, torqueClaimOfferId, setTorqueClaimOfferId, createOfferMutation]);

  /**
   * Execute a claim — routes through Torque if available, otherwise local
   */
  const claimViaTorque = useCallback(
    async (wallet: string, _points: number): Promise<ClaimResult> => {
      setClaiming(true);

      try {
        if (isTorqueClaim && offerId) {
          // Route through Torque
          try {
            // Start the offer journey
            await startOfferAsync({ offerId });

            // Small delay to let journey initialize
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Execute the claim action
            const signature = await executeAction.mutateAsync({
              offerId,
              index: 0,
            });

            // Refetch journey to confirm status
            refetchJourney();

            return {
              success: true,
              claimedAmount: _points,
              transactionSignature: signature || `torque_${Date.now()}`,
              timestamp: Date.now(),
            };
          } catch (torqueError) {
            console.warn('[ZombieClaim] Torque claim failed, falling back:', torqueError);
            // Fall back to local
            const result = await rewardsClient.claimRewards(wallet);
            return { ...result, transactionSignature: result.transactionSignature || `fallback_${Date.now()}` };
          }
        }

        // Local fallback
        return await rewardsClient.claimRewards(wallet);
      } finally {
        setClaiming(false);
      }
    },
    [isTorqueClaim, offerId, startOfferAsync, executeAction, refetchJourney]
  );

  return {
    claimViaTorque,
    torqueOfferId: offerId,
    journeyStatus,
    isTorqueClaim,
    fallbackReason,
    claiming,
  };
}
