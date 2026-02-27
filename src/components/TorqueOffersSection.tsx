/**
 * TorqueOffersSection Component
 *
 * Displays active Torque offers/campaigns the user can join.
 * Shows offer cards, accept buttons, and journey progress.
 *
 * @module components/TorqueOffersSection
 */

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTorqueIntegration } from '../hooks/useTorqueIntegration';

/**
 * Torque Offers section for the ZombieDashboard
 */
export function TorqueOffersSection() {
  const { connected } = useWallet();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const {
    isAuthenticated,
    authLoading,
    offers,
    offersLoading,
    startOffer,
    startingOffer,
    journey,
    journeyLoading,
    signIn,
  } = useTorqueIntegration(selectedOfferId ?? undefined);

  // Don't render if wallet isn't connected
  if (!connected) return null;

  // Not authenticated with Torque — show sign-in prompt
  if (!isAuthenticated) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-zombie-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white">Torque Campaigns</h2>
        </div>

        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zombie-green/10 flex items-center justify-center border border-zombie-green/30">
            <svg
              className="w-8 h-8 text-zombie-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Sign in to Torque
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Authenticate with Torque to access campaigns, earn rewards, and track your progress.
          </p>
          <button
            onClick={signIn}
            disabled={authLoading}
            className={`
              px-6 py-3 rounded-xl font-semibold text-sm transition-all
              ${authLoading
                ? 'bg-zombie-gray text-gray-500 cursor-not-allowed'
                : 'bg-zombie-green text-zombie-black hover:shadow-neon hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {authLoading ? 'Signing in...' : 'Sign in with Wallet'}
          </button>
        </div>
      </section>
    );
  }

  // Loading state
  if (offersLoading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-zombie-green animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white">Torque Campaigns</h2>
        </div>
        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-8 text-center">
          <p className="text-gray-400">Loading campaigns...</p>
        </div>
      </section>
    );
  }

  // No offers available
  if (offers.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-zombie-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white">Torque Campaigns</h2>
          <span className="px-2 py-1 text-xs rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
            Connected
          </span>
        </div>
        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-8 text-center">
          <p className="text-gray-400">No active campaigns right now. Check back later!</p>
        </div>
      </section>
    );
  }

  // Render offers
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-zombie-green"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h2 className="text-xl font-bold text-white">Torque Campaigns</h2>
        <span className="px-2 py-1 text-xs rounded-lg bg-zombie-green/20 text-zombie-green">
          {offers.length} active
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {offers.map((offer) => {
          const isSelected = selectedOfferId === offer.id;
          const requirementCount = offer.offerRequirements?.length ?? 0;
          const distributorCount = offer.distributors?.length ?? 0;

          // Determine reward info from first distributor
          const distributor = offer.distributors?.[0];
          const emissionType = distributor?.emissionType ?? 'POINTS';

          return (
            <div
              key={offer.id}
              className={`
                rounded-xl border p-5 transition-all
                ${isSelected
                  ? 'border-zombie-green/60 bg-zombie-green/5'
                  : 'border-zombie-green/20 bg-zombie-dark/50 hover:border-zombie-green/40'
                }
              `}
            >
              {/* Offer header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {offer.metadata?.title || 'Untitled Campaign'}
                  </h3>
                  {offer.metadata?.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {offer.metadata.description}
                    </p>
                  )}
                </div>
                <span className="ml-2 px-2 py-1 text-xs rounded-lg bg-zombie-green/20 text-zombie-green whitespace-nowrap">
                  {emissionType}
                </span>
              </div>

              {/* Offer details */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                {requirementCount > 0 && (
                  <span>{requirementCount} requirement{requirementCount > 1 ? 's' : ''}</span>
                )}
                {distributorCount > 0 && (
                  <span>{distributorCount} reward{distributorCount > 1 ? 's' : ''}</span>
                )}
              </div>

              {/* Journey progress (if selected and has journey) */}
              {isSelected && journey && (
                <div className="mb-4 p-3 rounded-lg bg-zombie-dark/80 border border-zombie-green/10">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400">Journey Progress</span>
                    <span
                      className={`font-mono ${
                        journey.status === 'DONE'
                          ? 'text-green-400'
                          : journey.status === 'FAILED' || journey.status === 'INVALID'
                          ? 'text-red-400'
                          : 'text-zombie-green'
                      }`}
                    >
                      {journey.status}
                    </span>
                  </div>
                  {journey.requirementJourneys && (
                    <div className="space-y-1">
                      {journey.requirementJourneys.map((req, idx) => (
                        <div
                          key={req.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              req.status === 'DONE'
                                ? 'bg-green-400'
                                : req.status === 'STARTED' || req.status === 'PENDING'
                                ? 'bg-yellow-400'
                                : req.status === 'FAILED' || req.status === 'INVALID'
                                ? 'bg-red-400'
                                : 'bg-gray-500'
                            }`}
                          />
                          <span className="text-gray-400">
                            Step {idx + 1}: {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {journeyLoading && (
                    <p className="text-xs text-gray-500 mt-1">Refreshing...</p>
                  )}
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => {
                  if (isSelected) {
                    // Already selected — unselect
                    setSelectedOfferId(null);
                  } else {
                    setSelectedOfferId(offer.id);
                    startOffer(offer.id);
                  }
                }}
                disabled={startingOffer}
                className={`
                  w-full py-2.5 rounded-lg font-semibold text-sm transition-all
                  ${isSelected
                    ? 'bg-zombie-green/20 text-zombie-green border border-zombie-green/40'
                    : startingOffer
                    ? 'bg-zombie-gray text-gray-500 cursor-not-allowed'
                    : 'bg-zombie-green text-zombie-black hover:shadow-neon hover:scale-[1.01] active:scale-[0.99]'
                  }
                `}
              >
                {startingOffer && !isSelected
                  ? 'Accepting...'
                  : isSelected
                  ? 'Accepted'
                  : 'Accept Offer'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TorqueOffersSection;
