/**
 * ClaimButton Component
 *
 * Simple once-per-day claim. Users claim all their zombie asset points
 * in one action, then wait 24 hours before claiming again.
 *
 * @module components/ClaimButton
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { rewardsClient } from '../lib/rewards';
import { useTorque } from '@torque-labs/react';
import type { ZombieAsset, ClaimHistoryEntry } from '../types';

interface ClaimButtonProps {
  zombieAssets: ZombieAsset[];
  pointsPerDay: number;
  onClaimSuccess?: (claimedAmount: number) => void;
}

type ClaimState = 'idle' | 'loading' | 'success' | 'error';

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function ClaimButton({
  zombieAssets,
  pointsPerDay,
  onClaimSuccess,
}: ClaimButtonProps) {
  const { publicKey } = useWallet();
  const { addToast, addClaimEntry, lastClaimTimestamp } = useAppStore();
  const [claimState, setClaimState] = useState<ClaimState>('idle');
  const [countdown, setCountdown] = useState<string | null>(null);
  const { isAuthenticated: torqueAuthenticated } = useTorque();

  // Cooldown check
  const now = Date.now();
  const timeSinceLastClaim = lastClaimTimestamp ? now - lastClaimTimestamp : Infinity;
  const onCooldown = timeSinceLastClaim < COOLDOWN_MS;
  const cooldownEndsAt = lastClaimTimestamp ? lastClaimTimestamp + COOLDOWN_MS : 0;

  // Points to claim = 10 pts per asset (1 day's worth)
  const claimablePoints = pointsPerDay || zombieAssets.length * 10;

  // Live countdown timer
  useEffect(() => {
    if (!onCooldown) {
      setCountdown(null);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, cooldownEndsAt - Date.now());
      if (remaining === 0) {
        setCountdown(null);
        return;
      }
      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${hrs}h ${mins}m ${secs}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [onCooldown, cooldownEndsAt]);

  const handleClick = async () => {
    if (!publicKey) {
      addToast('Wallet not connected', 'error');
      return;
    }

    if (onCooldown) {
      addToast('You can only claim once every 24 hours', 'warning');
      return;
    }

    setClaimState('loading');

    try {
      const result = await rewardsClient.claimRewards(publicKey.toString());

      if (result.success) {
        setClaimState('success');

        const entry: ClaimHistoryEntry = {
          id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          walletAddress: publicKey.toString(),
          pointsClaimed: claimablePoints,
          timestamp: Date.now(),
          txSignature: result.transactionSignature,
          claimType: 'points',
        };
        addClaimEntry(entry);

        addToast(`Claimed ${claimablePoints} pts from ${zombieAssets.length} zombie asset${zombieAssets.length > 1 ? 's' : ''}!`, 'success');
        onClaimSuccess?.(claimablePoints);

        setTimeout(() => setClaimState('idle'), 2000);
      } else {
        throw new Error('Claim failed');
      }
    } catch (error) {
      console.error('[ClaimButton] Claim error:', error);
      setClaimState('error');
      addToast(
        error instanceof Error ? error.message : 'Failed to claim rewards',
        'error'
      );
      setTimeout(() => setClaimState('idle'), 2000);
    }
  };

  const isLoading = claimState === 'loading';
  const isSuccess = claimState === 'success';
  const isError = claimState === 'error';
  const isDisabled = isLoading || onCooldown || zombieAssets.length === 0;

  return (
    <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-colors
            ${isSuccess ? 'bg-green-500/20' : isError ? 'bg-red-500/20' : onCooldown ? 'bg-yellow-500/20' : 'bg-zombie-green/20'}
          `}
        >
          {isSuccess ? (
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : isError ? (
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : onCooldown ? (
            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-zombie-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-white">
            {isSuccess ? 'Claimed!' : isError ? 'Claim Failed' : onCooldown ? 'On Cooldown' : 'Ready to Claim'}
          </h3>
          <p className="text-sm text-gray-500">
            {onCooldown
              ? `Come back in ${countdown || '...'}`
              : `${claimablePoints.toLocaleString()} pts from ${zombieAssets.length} asset${zombieAssets.length > 1 ? 's' : ''}`}
          </p>
          {torqueAuthenticated && (
            <p className="text-xs text-zombie-green mt-0.5">Torque connected</p>
          )}
        </div>
      </div>

      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg
          transition-all duration-200 flex items-center justify-center gap-3
          ${isDisabled
            ? 'bg-zombie-gray text-gray-500 cursor-not-allowed border border-zombie-green/20'
            : isSuccess
            ? 'bg-green-500 text-white hover:bg-green-600'
            : isError
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-zombie-green text-zombie-black hover:shadow-neon hover:scale-[1.02] active:scale-[0.98]'
          }
        `}
      >
        {isLoading ? (
          <>
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Claiming...
          </>
        ) : isSuccess ? (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Claimed!
          </>
        ) : onCooldown ? (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Next claim in {countdown || '...'}
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Claim {claimablePoints} pts
          </>
        )}
      </button>
    </div>
  );
}

export default ClaimButton;
