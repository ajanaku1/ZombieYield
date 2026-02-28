/**
 * useTorqueIntegration Hook
 *
 * Encapsulates all Torque SDK interactions using @torque-labs/react hooks.
 * Provides auth state, active offers, offer actions, journey tracking,
 * social connect, and user profile.
 *
 * @module hooks/useTorqueIntegration
 */

import { useCallback, useMemo } from 'react';
import {
  useTorque,
  useOffers,
  useStartOffer,
  useOfferJourney,
  useOfferAction,
  useOffer,
  useCurrentUser,
  useSocialConnect,
  useCreateOffer,
} from '@torque-labs/react';

/**
 * Torque integration hook
 *
 * Wraps all Torque SDK hooks into a single unified interface.
 * Gracefully handles errors — if Torque is unreachable, returns safe defaults.
 */
export function useTorqueIntegration(activeOfferId?: string, activeActionIndex?: number) {
  // Core auth state
  const {
    isAuthenticated,
    isLoading: authLoading,
    currentUser,
    authenticate,
    logout,
    setConnectModalOpen,
  } = useTorque();

  // Fetch active offers
  const {
    data: offers,
    isLoading: offersLoading,
    error: offersError,
    refetch: refetchOffers,
  } = useOffers({
    status: 'ACTIVE',
    enabled: isAuthenticated,
  });

  // Start offer mutation
  const {
    mutate: startOfferMutate,
    mutateAsync: startOfferAsync,
    isPending: startingOffer,
  } = useStartOffer({
    onSuccess: () => {
      refetchOffers();
    },
  });

  // Journey tracking for a specific offer
  const {
    data: journeyData,
    isLoading: journeyLoading,
    refetch: refetchJourney,
  } = useOfferJourney({
    offerId: activeOfferId ?? '',
    enabled: isAuthenticated && !!activeOfferId,
  });

  // Single offer detail
  const {
    data: currentOffer,
    isLoading: offerLoading,
  } = useOffer({
    offerId: activeOfferId ?? '',
    enabled: isAuthenticated && !!activeOfferId,
  });

  // Offer action (get transaction + execute for a specific step)
  const { getAction, executeAction } = useOfferAction({
    offerId: activeOfferId ?? '',
    index: activeActionIndex ?? 0,
    enabled: isAuthenticated && !!activeOfferId && activeActionIndex != null,
  });

  // Current user profile
  const {
    data: userProfile,
    isLoading: profileLoading,
  } = useCurrentUser({
    enabled: isAuthenticated,
  });

  // Social connect
  const {
    connect: socialConnect,
    isLoading: socialConnectLoading,
    error: socialConnectError,
  } = useSocialConnect();

  // Create offer mutation
  const createOfferMutation = useCreateOffer({
    onSuccess: (data) => {
      console.log('[Torque] Offer created:', data.id);
    },
    onError: (error) => {
      console.warn('[Torque] Failed to create offer:', error.message);
    },
  });

  // Get the user's journey (first one if exists)
  const journey = useMemo(() => {
    if (!journeyData || journeyData.length === 0) return null;
    return journeyData[0];
  }, [journeyData]);

  // Computed states
  const isLoading = authLoading || offersLoading;
  const offersCount = offers?.length ?? 0;

  // Start an offer
  const startOffer = useCallback(
    (offerId: string) => {
      startOfferMutate({ offerId });
    },
    [startOfferMutate]
  );

  // Execute an action within a journey
  const completeAction = useCallback(
    (offerId: string, index: number) => {
      executeAction.mutate({ offerId, index });
    },
    [executeAction]
  );

  // Prompt Torque sign-in
  const signIn = useCallback(async () => {
    try {
      await authenticate();
    } catch (error) {
      console.error('[Torque] Authentication failed:', error);
    }
  }, [authenticate]);

  // Social connect helpers
  const connectTwitter = useCallback(() => {
    socialConnect('twitter');
  }, [socialConnect]);

  const connectDiscord = useCallback(() => {
    socialConnect('discord' as any);
  }, [socialConnect]);

  return {
    // Auth
    isAuthenticated,
    authLoading,
    currentUser,
    signIn,
    logout,
    setConnectModalOpen,

    // Offers
    offers: offers ?? [],
    offersCount,
    offersLoading,
    offersError,
    refetchOffers,

    // Start offer
    startOffer,
    startOfferAsync,
    startingOffer,

    // Single offer detail
    currentOffer: currentOffer ?? null,
    offerLoading,

    // Journey
    journey,
    journeyLoading,
    refetchJourney,

    // Actions
    getAction,
    completeAction,
    executeActionPending: executeAction.isPending,

    // User profile
    userProfile: userProfile ?? null,
    profileLoading,

    // Social
    connectTwitter,
    connectDiscord,
    socialConnectLoading,
    socialConnectError,

    // Create offer
    createOffer: createOfferMutation,

    // General
    isLoading,
  };
}
