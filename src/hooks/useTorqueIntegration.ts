/**
 * useTorqueIntegration Hook
 *
 * Encapsulates all Torque SDK interactions using @torque-labs/react hooks.
 * Provides auth state, active offers, offer start mutation, and journey tracking.
 *
 * @module hooks/useTorqueIntegration
 */

import { useCallback, useMemo } from 'react';
import { useTorque, useOffers, useStartOffer, useOfferJourney } from '@torque-labs/react';

/**
 * Torque integration hook
 *
 * Wraps all Torque SDK hooks into a single unified interface.
 * Gracefully handles errors — if Torque is unreachable, returns safe defaults.
 */
export function useTorqueIntegration(activeOfferId?: string) {
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

  // Prompt Torque sign-in
  const signIn = useCallback(async () => {
    try {
      await authenticate();
    } catch (error) {
      console.error('[Torque] Authentication failed:', error);
    }
  }, [authenticate]);

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

    // Journey
    journey,
    journeyLoading,
    refetchJourney,

    // General
    isLoading,
  };
}
