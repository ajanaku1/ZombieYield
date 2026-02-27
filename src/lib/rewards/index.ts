/**
 * Rewards Adapter Selector
 *
 * The Torque SDK adapter is now the default (always available via TorqueProvider).
 * Mock adapter is used when VITE_USE_MOCK_REWARDS=true (useful for offline dev).
 *
 * @module lib/rewards/index
 */

import type { RewardsAdapter } from './rewardsAdapter';
import { mockRewardsAdapter } from './mockRewardsAdapter';
import { torqueRewardsAdapter } from './torqueRewardsAdapter';

/**
 * Determine which adapter to use based on environment
 */
function selectAdapter(): RewardsAdapter {
  const useMock = import.meta.env.VITE_USE_MOCK_REWARDS === 'true';

  if (useMock) {
    if (import.meta.env.DEV) {
      console.log('[RewardsAdapter] Using MockRewardsAdapter (forced via env)');
    }
    return mockRewardsAdapter;
  }

  // Default: Torque SDK adapter
  if (import.meta.env.DEV) {
    console.log('[RewardsAdapter] Using TorqueSDK adapter');
  }
  return torqueRewardsAdapter;
}

/**
 * Selected rewards adapter instance
 */
export const rewardsClient: RewardsAdapter = selectAdapter();

/**
 * Re-export types for convenience
 */
export type { RewardsAdapter, UserPointsData, ClaimResult } from './rewardsAdapter';

/**
 * Re-export adapters for testing/debugging
 */
export { mockRewardsAdapter } from './mockRewardsAdapter';
export { torqueRewardsAdapter } from './torqueRewardsAdapter';

/**
 * Get current adapter info (useful for debug panel)
 */
export function getAdapterInfo(): {
  name: string;
  isConfigured: boolean;
  isTorqueSDK: boolean;
} {
  return {
    name: rewardsClient.getAdapterName(),
    isConfigured: rewardsClient.isConfigured(),
    isTorqueSDK: rewardsClient.getAdapterName() === 'TorqueSDK',
  };
}
