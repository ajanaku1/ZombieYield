/**
 * TorqueOffersSection Component
 *
 * Enhanced Torque offers UI with requirement labels, progress bars,
 * reward display, detail expansion, and completed offers.
 *
 * @module components/TorqueOffersSection
 */

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTorqueIntegration } from '../hooks/useTorqueIntegration';

export function TorqueOffersSection() {
  const { connected } = useWallet();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

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
    completeAction,
    executeActionPending,
  } = useTorqueIntegration(selectedOfferId ?? undefined);

  // Track if Torque auth has been loading too long (stuck)
  const authTimedOut = useRef(false);
  const [forceShowButton, setForceShowButton] = useState(false);

  useEffect(() => {
    if (!authLoading || isAuthenticated) {
      authTimedOut.current = false;
      return;
    }
    // If auth is loading for more than 5s, stop showing spinner
    const timer = setTimeout(() => {
      authTimedOut.current = true;
      setForceShowButton(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated]);

  if (!connected) return null;

  // Not authenticated — sign-in prompt
  if (!isAuthenticated) {
    const showLoading = authLoading && !forceShowButton;

    return (
      <section>
        <SectionHeader />
        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zombie-green/10 flex items-center justify-center border border-zombie-green/30">
            <BoltIcon className="w-8 h-8 text-zombie-green" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sign in to Torque</h3>
          <p className="text-sm text-gray-400 mb-4">
            Authenticate with Torque to access campaigns, earn rewards, and track your progress.
          </p>
          <button
            onClick={() => {
              setForceShowButton(false);
              signIn();
            }}
            disabled={showLoading}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              showLoading
                ? 'bg-zombie-gray text-gray-500 cursor-not-allowed'
                : 'bg-zombie-green text-zombie-black hover:shadow-neon hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {showLoading ? 'Signing in...' : 'Sign in with Wallet'}
          </button>
        </div>
      </section>
    );
  }

  // Loading
  if (offersLoading) {
    return (
      <section>
        <SectionHeader loading />
        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-8 text-center">
          <p className="text-gray-400">Loading campaigns...</p>
        </div>
      </section>
    );
  }

  // No offers
  if (offers.length === 0) {
    return (
      <section>
        <SectionHeader badge="Connected" />
        <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-8 text-center">
          <p className="text-gray-400">No active campaigns right now. Check back later!</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader count={offers.length} />

      <div className="grid gap-4 sm:grid-cols-2">
        {offers.map((offer) => {
          const isSelected = selectedOfferId === offer.id;
          const isExpanded = expandedOfferId === offer.id;
          const requirements = offer.offerRequirements ?? [];
          const distributors = offer.distributors ?? [];
          const distributor = distributors[0];
          const emissionType = distributor?.emissionType ?? 'POINTS';

          // Journey step counts
          const doneSteps = journey?.requirementJourneys?.filter(
            (r: any) => r.status === 'DONE'
          ).length ?? 0;
          const totalSteps = journey?.requirementJourneys?.length ?? requirements.length;
          const progressPct = totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0;

          return (
            <div
              key={offer.id}
              className={`rounded-xl border p-5 transition-all ${
                isSelected
                  ? 'border-zombie-green/60 bg-zombie-green/5'
                  : 'border-zombie-green/20 bg-zombie-dark/50 hover:border-zombie-green/40'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {offer.metadata?.title || 'Untitled Campaign'}
                  </h3>
                  {offer.metadata?.description && (
                    <p className={`text-sm text-gray-400 mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {offer.metadata.description}
                    </p>
                  )}
                </div>
                <span className="ml-2 px-2 py-1 text-xs rounded-lg bg-zombie-green/20 text-zombie-green whitespace-nowrap">
                  {emissionType}
                </span>
              </div>

              {/* Requirement labels */}
              {requirements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {requirements.map((req: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs rounded-md bg-zombie-dark/80 border border-zombie-green/10 text-gray-400"
                    >
                      {req.type || `Step ${idx + 1}`}
                    </span>
                  ))}
                </div>
              )}

              {/* Reward info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                {requirements.length > 0 && (
                  <span>{requirements.length} requirement{requirements.length > 1 ? 's' : ''}</span>
                )}
                {distributors.length > 0 && (
                  <span>{distributors.length} reward{distributors.length > 1 ? 's' : ''}</span>
                )}
                {(distributor as any)?.amount && (
                  <span className="text-zombie-green font-mono">
                    {(distributor as any).amount} {emissionType}
                  </span>
                )}
              </div>

              {/* Journey progress bar */}
              {isSelected && journey && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Progress</span>
                    <span className={`font-mono ${
                      journey.status === 'DONE' ? 'text-green-400'
                        : journey.status === 'FAILED' || journey.status === 'INVALID' ? 'text-red-400'
                        : 'text-zombie-green'
                    }`}>
                      {doneSteps}/{totalSteps} {journey.status === 'DONE' && 'Complete'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zombie-gray overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        journey.status === 'DONE' ? 'bg-green-400' : 'bg-zombie-green'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Step details */}
                  {journey.requirementJourneys && (
                    <div className="mt-2 space-y-1">
                      {journey.requirementJourneys.map((req: any, idx: number) => (
                        <div key={req.id} className="flex items-center gap-2 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            req.status === 'DONE' ? 'bg-green-400'
                              : req.status === 'STARTED' || req.status === 'PENDING' ? 'bg-yellow-400'
                              : req.status === 'FAILED' || req.status === 'INVALID' ? 'bg-red-400'
                              : 'bg-gray-500'
                          }`} />
                          <span className="text-gray-400 flex-1">
                            Step {idx + 1}: {requirements[idx]?.type || req.status}
                          </span>
                          {req.status !== 'DONE' && req.status !== 'FAILED' && (
                            <button
                              onClick={() => completeAction(offer.id, idx)}
                              disabled={executeActionPending}
                              className="px-2 py-0.5 text-xs rounded bg-zombie-green/20 text-zombie-green hover:bg-zombie-green/30 transition-colors"
                            >
                              Execute
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {journeyLoading && (
                    <p className="text-xs text-gray-500 mt-1">Refreshing...</p>
                  )}
                </div>
              )}

              {/* View details toggle */}
              {(requirements.length > 2 || offer.metadata?.description) && (
                <button
                  onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
                  className="text-xs text-zombie-green hover:underline mb-3 block"
                >
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </button>
              )}

              {/* Expanded detail */}
              {isExpanded && requirements.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-zombie-dark/80 border border-zombie-green/10">
                  <p className="text-xs text-gray-400 font-semibold mb-2">All Requirements</p>
                  {requirements.map((req: any, idx: number) => (
                    <div key={idx} className="text-xs text-gray-400 py-1 border-b border-zombie-green/5 last:border-0">
                      <span className="text-zombie-green mr-2">{idx + 1}.</span>
                      {req.type || 'Action'} {req.value && `— ${req.value}`}
                    </div>
                  ))}
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => {
                  if (isSelected) {
                    setSelectedOfferId(null);
                  } else {
                    setSelectedOfferId(offer.id);
                    startOffer(offer.id);
                  }
                }}
                disabled={startingOffer}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  isSelected
                    ? journey?.status === 'DONE'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : 'bg-zombie-green/20 text-zombie-green border border-zombie-green/40'
                    : startingOffer
                    ? 'bg-zombie-gray text-gray-500 cursor-not-allowed'
                    : 'bg-zombie-green text-zombie-black hover:shadow-neon hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {startingOffer && !isSelected
                  ? 'Accepting...'
                  : isSelected && journey?.status === 'DONE'
                  ? 'Completed'
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

function SectionHeader({ count, badge, loading }: { count?: number; badge?: string; loading?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {loading ? (
        <svg className="w-5 h-5 text-zombie-green animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <BoltIcon className="w-5 h-5 text-zombie-green" />
      )}
      <h2 className="text-xl font-bold text-white">Torque Campaigns</h2>
      {count != null && (
        <span className="px-2 py-1 text-xs rounded-lg bg-zombie-green/20 text-zombie-green">
          {count} active
        </span>
      )}
      {badge && (
        <span className="px-2 py-1 text-xs rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
          {badge}
        </span>
      )}
    </div>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

export default TorqueOffersSection;
