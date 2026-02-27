/**
 * ZombieDashboard Component
 *
 * Main dashboard component with Torque rewards integration.
 * Uses rewards adapter for points and claims.
 *
 * @module components/ZombieDashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useScanner } from '../hooks/useScanner';
import { rewardsClient } from '../lib/rewards';
import type { UserPointsData } from '../lib/rewards';
import { ZombieStatsCard } from './ZombieStatsCard';
import { ZombieAssetsTable } from './ZombieAssetsTable';
import { ClaimButton } from './ClaimButton';
import { TorqueOffersSection } from './TorqueOffersSection';

/**
 * Format time ago from timestamp
 */
function formatTimeAgo(timestamp: number | null): string {
  if (!timestamp) return '';

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/**
 * Main dashboard component
 */
export function ZombieDashboard() {
  const { connected, publicKey } = useWallet();
  const { loading: scanning, zombieAssets, totalFound, error: scanError, refetch, lastScanTime, isDevMode } = useScanner();

  // Points state from rewards adapter
  const [pointsData, setPointsData] = useState<UserPointsData | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);

  // Track wallet connection time for local fallback
  const [walletConnectedAt, setWalletConnectedAt] = useState<number | null>(null);

  // Set connection time when wallet connects
  useEffect(() => {
    if (connected && publicKey && !walletConnectedAt) {
      setWalletConnectedAt(Date.now());
    } else if (!connected) {
      setWalletConnectedAt(null);
      setPointsData(null);
      setPointsError(null);
    }
  }, [connected, publicKey, walletConnectedAt]);

  /**
   * Fetch points from rewards adapter
   */
  const fetchPoints = useCallback(async () => {
    if (!publicKey || !connected) return;

    setLoadingPoints(true);
    setPointsError(null);

    try {
      const points = await rewardsClient.getUserPoints(
        publicKey.toString(),
        totalFound,
        walletConnectedAt || Date.now()
      );
      setPointsData(points);
    } catch (error) {
      console.error('[Dashboard] Error fetching points:', error);
      setPointsError(error instanceof Error ? error.message : 'Failed to fetch points');
    } finally {
      setLoadingPoints(false);
    }
  }, [publicKey, connected, totalFound, walletConnectedAt]);

  // Fetch points when wallet connects or assets change
  useEffect(() => {
    if (connected && publicKey && totalFound > 0 && walletConnectedAt) {
      fetchPoints();
    }
  }, [connected, publicKey, totalFound, walletConnectedAt, fetchPoints]);

  // Handle manual refresh
  const handleRefresh = async () => {
    await refetch();
    // Points will auto-refresh via useEffect
  };

  // Handle successful claim
  const handleClaimSuccess = () => {
    // Refresh points after claim
    fetchPoints();
  };

  // Not connected state
  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-16">
          {/* Zombie mascot */}
          <div
            className="
              w-24 h-24 mx-auto mb-6 rounded-3xl
              bg-zombie-green/10 flex items-center justify-center
              border-2 border-zombie-green/30 shadow-neon
              animate-pulse
            "
          >
            <span className="text-5xl">🧟</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to <span className="text-zombie-green">ZombieYield</span>
          </h2>

          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Connect your wallet to resurrect your bags and start earning rewards.
          </p>

          {/* Supported wallets */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-zombie-green animate-pulse" />
            Supporting Phantom & Solflare on Devnet
          </div>
        </div>
      </div>
    );
  }

  // Prepare display data
  const displayPoints = pointsData || {
    totalPoints: 0,
    pointsPerDay: 0,
    availableToClaim: 0,
  };

  const isLoading = scanning || loadingPoints;

  // Connected state
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          {isDevMode && (
            <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
              DEV MODE
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl
            text-sm font-medium transition-all
            ${isLoading
              ? 'bg-zombie-gray text-gray-500 cursor-not-allowed'
              : 'bg-zombie-green/10 text-zombie-green hover:bg-zombie-green/20'
            }
          `}
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Section */}
      <section>
        <ZombieStatsCard
          totalAssets={totalFound}
          pointsPerDay={displayPoints.pointsPerDay}
          totalPoints={displayPoints.totalPoints}
          loading={isLoading && !lastScanTime}
        />

        {/* Last scan time */}
        {lastScanTime && (
          <p className="text-xs text-gray-500 mt-2 text-right">
            Last scanned: {formatTimeAgo(lastScanTime)}
          </p>
        )}

        {/* Points error */}
        {pointsError && (
          <p className="text-xs text-red-400 mt-2 text-right">
            {pointsError}
          </p>
        )}
      </section>

      {/* Assets Section */}
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Zombie Assets
            {totalFound > 0 && (
              <span
                className="
                  px-2 py-1 text-xs rounded-lg
                  bg-zombie-green/20 text-zombie-green
                "
              >
                {totalFound}
              </span>
            )}
          </h2>
        </div>

        <ZombieAssetsTable assets={zombieAssets} loading={scanning} />

        {/* Scan error */}
        {scanError && (
          <div
            className="
              mt-4 p-4 rounded-xl border border-red-500/50
              bg-red-500/10 text-red-400 text-sm
            "
          >
            <p className="font-medium">Scan Error</p>
            <p>{scanError}</p>
          </div>
        )}
      </section>

      {/* Torque Campaigns Section */}
      <TorqueOffersSection />

      {/* Claim Section */}
      {totalFound > 0 && !scanning && (
        <section>
          <ClaimButton
            disabled={displayPoints.availableToClaim === 0}
            totalPoints={displayPoints.availableToClaim}
            onClaimSuccess={handleClaimSuccess}
          />
        </section>
      )}
    </div>
  );
}

export default ZombieDashboard;
