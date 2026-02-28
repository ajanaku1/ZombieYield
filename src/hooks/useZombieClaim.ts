/**
 * useZombieClaim Hook
 *
 * Wires the ZombieYield claim flow through Torque SDK with:
 * - Project creation (required for custom events)
 * - Multi-step requirements (scan 3+ zombie assets + claim)
 * - POINTS distributor for real reward distribution
 * - Custom event firing on scan completion
 * - Graceful local fallback
 *
 * @module hooks/useZombieClaim
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useTorque,
  useOffers,
  useStartOffer,
  useOfferJourney,
  useCreateOffer,
  useCreateProject,
  useAddDistributor,
  useDeployDistributor,
} from '@torque-labs/react';
import { rewardsClient } from '../lib/rewards';
import { useAppStore } from '../store/appStore';
import type { ClaimResult } from '../lib/rewards/rewardsAdapter';

const ZOMBIE_PROJECT_NAME = 'ZombieYield';
const ZOMBIE_OFFER_TITLE = 'ZombieYield Daily Rewards';

export function useZombieClaim() {
  const { isAuthenticated, torque } = useTorque();
  const {
    torqueProjectId: cachedProjectId,
    setTorqueProjectId,
    torqueClaimOfferId,
    setTorqueClaimOfferId,
  } = useAppStore();

  const [projectId, setProjectId] = useState<string | null>(cachedProjectId);
  const [offerId, setOfferId] = useState<string | null>(torqueClaimOfferId);
  const [isTorqueClaim, setIsTorqueClaim] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [scanEventFired, setScanEventFired] = useState(false);
  const setupAttempted = useRef(false);

  // Fetch active offers to find our ZombieYield offer
  const {
    data: offers,
    isLoading: offersLoading,
  } = useOffers({
    status: 'ACTIVE',
    enabled: isAuthenticated,
  });

  // Deploy distributor on-chain after adding
  const deployDistributorMutation = useDeployDistributor({
    onSuccess: (data) => {
      console.log('[ZombieClaim] Distributor deployed on-chain:', data.signature);
    },
    onError: (error) => {
      console.warn('[ZombieClaim] Distributor deploy failed (non-blocking):', error.message);
    },
  });

  // Add distributor mutation — on success, deploy it on-chain
  const addDistributorMutation = useAddDistributor({
    onSuccess: (data) => {
      console.log('[ZombieClaim] POINTS distributor added:', data.id);

      // Deploy the distributor on-chain so rewards are actually distributed
      if (offerId) {
        deployDistributorMutation.mutate({
          offerId,
          distributorId: data.id,
        } as any);
      }
    },
    onError: (error) => {
      console.warn('[ZombieClaim] Distributor add failed:', error.message);
    },
  });

  // Create offer mutation — on success, add POINTS distributor
  const createOfferMutation = useCreateOffer({
    onSuccess: (data) => {
      console.log('[ZombieClaim] Created ZombieYield offer:', data.id);
      setOfferId(data.id);
      setTorqueClaimOfferId(data.id);
      setIsTorqueClaim(true);
      setFallbackReason(null);

      // Attach POINTS distributor to the offer
      addDistributorMutation.mutate({
        offerId: data.id,
        distributor: {
          type: 'CONVERSION',
          emissionType: 'POINTS',
          totalFundAmount: 100000,
          distributionFunction: {
            type: 'CONSTANT',
            yIntercept: 10,
          },
          crankGuard: {
            recipient: 'USER',
            activation: {
              type: 'OFFER_START' as any,
            },
            distributionFunctionInput: {
              type: 'CONVERSION_INDEX' as any,
            },
            availability: {
              maxConversionsPerRecipient: 1,
              recipientConversionPeriod: 'DAILY' as any,
              maxTotalConversions: null,
            },
          },
        } as any,
      });
    },
    onError: (error) => {
      console.warn('[ZombieClaim] Failed to create offer:', error.message);
      setIsTorqueClaim(false);
      setFallbackReason(`Offer creation failed: ${error.message}`);
    },
  });

  // Create project mutation — required for custom events
  const createProjectMutation = useCreateProject({
    onSuccess: (data) => {
      console.log('[ZombieClaim] Created Torque project:', data.id);
      setProjectId(data.id);
      setTorqueProjectId(data.id);
    },
    onError: (error) => {
      console.warn('[ZombieClaim] Project creation failed:', error.message);
      setFallbackReason(`Project creation failed: ${error.message}`);
    },
  });

  // Start offer mutation
  const { mutateAsync: startOfferAsync } = useStartOffer();

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

  /**
   * Create the ZombieYield offer with projectId
   */
  const createZombieOffer = useCallback(
    (pid: string) => {
      const now = new Date();
      const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      createOfferMutation.mutate({
        projectId: pid,
        metadata: {
          title: ZOMBIE_OFFER_TITLE,
          description: 'Scan your wallet for zombie Solana assets and claim daily point rewards. Hold 3+ zombie assets to qualify.',
        },
        startTime: now,
        endTime: oneYearFromNow,
        requirements: [
          // Step 1: Scan and find 3+ zombie assets (CUSTOM event)
          {
            type: 'CUSTOM' as any,
            config: {
              eventName: 'zombie_scan_complete',
              fields: [{
                fieldName: 'assetsFound',
                validation: { type: 'number', min: 3 },
              }],
            },
            oracle: 'CUSTOM_EVENT_PROVIDER' as const,
          },
          // Step 2: Claim daily rewards
          {
            type: 'CLAIM' as any,
            config: {
              claim: { type: 'boolean' as const, exact: true },
            },
            oracle: 'CUSTOM_EVENT_PROVIDER' as const,
          },
        ],
      } as any);
    },
    [createOfferMutation]
  );

  // When project is created, proceed to create the offer
  useEffect(() => {
    if (projectId && !offerId && !createOfferMutation.isPending && isAuthenticated) {
      // Check if we already attempted offer creation
      if (setupAttempted.current) return;
      setupAttempted.current = true;
      createZombieOffer(projectId);
    }
  }, [projectId, offerId, createOfferMutation.isPending, isAuthenticated, createZombieOffer]);

  // Find existing offer or initiate project + offer creation
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

      // No existing offer found — need a project first for custom events
      if (projectId) {
        // Already have a project, create the offer directly
        setupAttempted.current = true;
        createZombieOffer(projectId);
      } else {
        // Create the project first, offer creation will follow via useEffect
        console.log('[ZombieClaim] Creating Torque project for custom events...');
        createProjectMutation.mutate({
          name: ZOMBIE_PROJECT_NAME,
          description: 'ZombieYield — Resurrect your dead Solana bags and earn daily point rewards.',
          website: 'https://zombieyield.vercel.app',
        } as any);
      }
    }
  }, [isAuthenticated, offers, offersLoading, torqueClaimOfferId, setTorqueClaimOfferId, projectId, createZombieOffer, createProjectMutation]);

  /**
   * Fire the zombie_scan_complete custom event (requirement index 0)
   * Called when the scanner finds 3+ zombie assets
   */
  const fireScanEvent = useCallback(
    async (assetsFound: number) => {
      if (!offerId || !isAuthenticated || assetsFound < 3 || scanEventFired) return;

      try {
        // Execute action at index 0 (zombie_scan_complete requirement)
        await torque.offers.actions.executeAction(offerId, 0);
        setScanEventFired(true);
        console.log('[ZombieClaim] Scan event fired: %d assets found', assetsFound);
      } catch (e) {
        // Expected to fail if offer doesn't exist on Torque or no journey started
        console.warn('[ZombieClaim] Scan event fire failed (expected if no journey):', e);
      }
    },
    [offerId, isAuthenticated, scanEventFired, torque]
  );

  /**
   * Execute a claim — routes through Torque if available, otherwise local
   * Uses action index 1 (CLAIM requirement) for the two-step journey
   */
  const claimViaTorque = useCallback(
    async (wallet: string, points: number): Promise<ClaimResult> => {
      setClaiming(true);

      try {
        if (isTorqueClaim && offerId) {
          try {
            // Start the offer journey
            await startOfferAsync({ offerId });

            // Execute the claim action at index 1 (second requirement)
            const signature = await torque.offers.actions.executeAction(offerId, 1);

            // Refetch journey to confirm status
            refetchJourney();

            return {
              success: true,
              claimedAmount: points,
              transactionSignature: signature || `torque_${Date.now()}`,
              timestamp: Date.now(),
            };
          } catch (torqueError) {
            console.warn('[ZombieClaim] Torque claim failed, falling back:', torqueError);
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
    [isTorqueClaim, offerId, startOfferAsync, torque, refetchJourney]
  );

  return {
    claimViaTorque,
    fireScanEvent,
    torqueOfferId: offerId,
    torqueProjectId: projectId,
    journeyStatus,
    journey,
    isTorqueClaim,
    fallbackReason,
    claiming,
    scanEventFired,
  };
}
