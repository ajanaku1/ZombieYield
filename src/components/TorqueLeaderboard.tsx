/**
 * TorqueLeaderboard Component
 *
 * Displays a leaderboard of top zombie asset claimers.
 * Uses Torque offer conversions when available, falls back to local claim history.
 *
 * @module components/TorqueLeaderboard
 */

import { useMemo } from 'react';
import { useTorque, useOfferConversions, useOfferAnalytics } from '@torque-labs/react';
import { useZombieClaim } from '../hooks/useZombieClaim';
import { useAppStore } from '../store/appStore';

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  points: number;
  claims: number;
}

function truncateWallet(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function TorqueLeaderboard() {
  const { isAuthenticated } = useTorque();
  const { torqueOfferId } = useZombieClaim();
  const { claimHistory } = useAppStore();

  // Fetch Torque conversions for the ZombieYield offer
  const {
    data: conversions,
    isLoading: conversionsLoading,
  } = useOfferConversions({
    offerId: torqueOfferId ?? '',
    enabled: isAuthenticated && !!torqueOfferId,
  });

  // Fetch aggregate analytics for the ZombieYield offer
  const {
    data: analytics,
  } = useOfferAnalytics({
    offerId: torqueOfferId ?? '',
    intervalType: 'day',
    enabled: isAuthenticated && !!torqueOfferId,
  });

  // Build leaderboard from local claim history
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    // Aggregate claims by wallet from local history
    const walletMap = new Map<string, { points: number; claims: number }>();

    for (const entry of claimHistory) {
      const existing = walletMap.get(entry.walletAddress);
      if (existing) {
        existing.points += entry.pointsClaimed;
        existing.claims += 1;
      } else {
        walletMap.set(entry.walletAddress, {
          points: entry.pointsClaimed,
          claims: 1,
        });
      }
    }

    // Convert to sorted array
    const entries = Array.from(walletMap.entries())
      .map(([wallet, data]) => ({
        wallet,
        points: data.points,
        claims: data.claims,
        rank: 0,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    return entries;
  }, [claimHistory]);

  // Torque conversion count (shows real on-chain activity)
  const torqueConversionCount = conversions?.length ?? 0;

  const hasData = leaderboard.length > 0 || torqueConversionCount > 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Leaderboard
          {torqueConversionCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-lg bg-zombie-green/20 text-zombie-green">
              {torqueConversionCount} conversion{torqueConversionCount !== 1 ? 's' : ''}
            </span>
          )}
        </h2>
      </div>

      {/* Campaign analytics summary */}
      {analytics && (analytics.totalConversions > 0 || analytics.totalRewards > 0) && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-3 text-center">
            <p className="text-lg font-bold text-zombie-green">{analytics.totalConversions}</p>
            <p className="text-xs text-gray-500">Total Claims</p>
          </div>
          <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-3 text-center">
            <p className="text-lg font-bold text-zombie-green">{analytics.totalRewards.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Points Distributed</p>
          </div>
          <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-3 text-center">
            <p className="text-lg font-bold text-zombie-green">{leaderboard.length}</p>
            <p className="text-xs text-gray-500">Unique Claimers</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 overflow-hidden">
        {conversionsLoading ? (
          <div className="p-8 text-center">
            <svg className="w-6 h-6 animate-spin text-zombie-green mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-gray-500">Loading leaderboard...</p>
          </div>
        ) : !hasData ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zombie-green/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No claims yet. Be the first to claim!</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_80px_60px] gap-2 px-4 py-3 border-b border-zombie-green/10 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span>#</span>
              <span>Wallet</span>
              <span className="text-right">Points</span>
              <span className="text-right">Claims</span>
            </div>

            {/* Entries */}
            {leaderboard.map((entry) => (
              <div
                key={entry.wallet}
                className={`
                  grid grid-cols-[40px_1fr_80px_60px] gap-2 px-4 py-3
                  border-b border-zombie-green/5 last:border-b-0
                  transition-colors hover:bg-zombie-green/5
                  ${entry.rank <= 3 ? 'bg-zombie-green/5' : ''}
                `}
              >
                {/* Rank */}
                <span className={`
                  text-sm font-bold
                  ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-300' : entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'}
                `}>
                  {entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : entry.rank === 3 ? '3rd' : entry.rank}
                </span>

                {/* Wallet */}
                <span className="text-sm text-white font-mono">
                  {truncateWallet(entry.wallet)}
                </span>

                {/* Points */}
                <span className="text-sm text-zombie-green text-right font-semibold">
                  {entry.points.toLocaleString()}
                </span>

                {/* Claims */}
                <span className="text-sm text-gray-400 text-right">
                  {entry.claims}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Footer with Torque badge */}
        {isAuthenticated && torqueOfferId && (
          <div className="px-4 py-2 border-t border-zombie-green/10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs text-zombie-green">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Tracked by Torque
            </span>
            {torqueConversionCount > 0 && (
              <span className="text-xs text-gray-500">
                {torqueConversionCount} on-chain conversion{torqueConversionCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default TorqueLeaderboard;
