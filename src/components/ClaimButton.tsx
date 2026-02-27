/**
 * ClaimButton Component
 *
 * Claim button with full rewards adapter integration.
 * Handles loading, success, and error states with toast feedback.
 *
 * @module components/ClaimButton
 */

import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { rewardsClient } from '../lib/rewards';
import { useTorque } from '@torque-labs/react';

interface ClaimButtonProps {
  disabled?: boolean;
  totalPoints?: number;
  onClaimSuccess?: (claimedAmount: number) => void;
}

type ClaimState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Claim rewards button component with full state management
 */
export function ClaimButton({
  disabled = false,
  totalPoints = 0,
  onClaimSuccess,
}: ClaimButtonProps) {
  const { publicKey } = useWallet();
  const { addToast } = useAppStore();
  const [claimState, setClaimState] = useState<ClaimState>('idle');
  const { isAuthenticated: torqueAuthenticated } = useTorque();

  const handleClick = async () => {
    if (!publicKey) {
      addToast('Wallet not connected', 'error');
      return;
    }

    if (disabled || totalPoints === 0) {
      addToast('No points available to claim', 'warning');
      return;
    }

    setClaimState('loading');

    try {
      // Call rewards adapter
      const result = await rewardsClient.claimRewards(publicKey.toString());

      if (result.success) {
        setClaimState('success');
        addToast('🧟 Rewards claimed. The undead provide.', 'success');
        onClaimSuccess?.(result.claimedAmount);

        // Reset to idle after success animation
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

      // Reset to idle after error
      setTimeout(() => setClaimState('idle'), 2000);
    }
  };

  const isLoading = claimState === 'loading';
  const isSuccess = claimState === 'success';
  const isError = claimState === 'error';

  // Determine button state
  const isDisabled = disabled || isLoading || totalPoints === 0;

  return (
    <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            transition-colors
            ${isSuccess
              ? 'bg-green-500/20'
              : isError
              ? 'bg-red-500/20'
              : 'bg-zombie-green/20'
            }
          `}
        >
          {isSuccess ? (
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : isError ? (
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-zombie-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-white">
            {isSuccess
              ? 'Claimed!'
              : isError
              ? 'Claim Failed'
              : 'Ready to Claim'}
          </h3>
          <p className="text-sm text-gray-500">
            {totalPoints > 0
              ? `${totalPoints.toLocaleString()} points available`
              : 'Earn points by holding zombie assets'}
          </p>
          {torqueAuthenticated && (
            <p className="text-xs text-zombie-green mt-0.5">
              Torque connected
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg
          transition-all duration-200 flex items-center justify-center gap-3
          ${
            isDisabled
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
            <svg
              className="w-6 h-6 animate-spin"
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
            Claiming...
          </>
        ) : isSuccess ? (
          <>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Claimed!
          </>
        ) : (
          <>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Claim Rewards
          </>
        )}
      </button>
    </div>
  );
}

export default ClaimButton;
