/**
 * ZombieYield Store
 *
 * Centralized state management using Zustand with localStorage persistence.
 * Handles wallet state, zombie assets, points, claim history, and UI state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ZombieAsset, PointsData, Toast, ClaimHistoryEntry } from '../types';

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  shortAddress: string | null;
}

interface TorqueAuthState {
  isAuthenticated: boolean;
  pubkey?: string;
}

interface AppState {
  // Wallet state
  wallet: WalletState;

  // Zombie assets
  zombieAssets: ZombieAsset[];
  isScanning: boolean;
  scanComplete: boolean;

  // Points
  pointsData: PointsData | null;

  // Claim history (persisted)
  claimHistory: ClaimHistoryEntry[];
  lastClaimTimestamp: number | null;

  // Per-asset claim cooldowns (persisted) — maps mint address → last claim timestamp
  claimedAssetTimestamps: Record<string, number>;

  // Torque auth state (persisted)
  torqueAuthState: TorqueAuthState;

  // Cached ZombieYield Torque project & offer IDs (persisted)
  torqueProjectId: string | null;
  torqueClaimOfferId: string | null;

  // UI state
  toasts: Toast[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setWallet: (connected: boolean, publicKey: string | null) => void;
  setZombieAssets: (assets: ZombieAsset[]) => void;
  setPointsData: (data: PointsData) => void;
  setIsScanning: (scanning: boolean) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  setError: (error: string | null) => void;
  addClaimEntry: (entry: ClaimHistoryEntry) => void;
  markAssetsClaimed: (mints: string[]) => void;
  setTorqueAuthState: (state: TorqueAuthState) => void;
  setTorqueProjectId: (id: string | null) => void;
  setTorqueClaimOfferId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  wallet: {
    connected: false,
    publicKey: null,
    shortAddress: null,
  },
  zombieAssets: [] as ZombieAsset[],
  isScanning: false,
  scanComplete: false,
  pointsData: null,
  claimHistory: [] as ClaimHistoryEntry[],
  lastClaimTimestamp: null as number | null,
  claimedAssetTimestamps: {} as Record<string, number>,
  torqueAuthState: { isAuthenticated: false } as TorqueAuthState,
  torqueProjectId: null as string | null,
  torqueClaimOfferId: null as string | null,
  toasts: [] as Toast[],
  isLoading: false,
  error: null as string | null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setWallet: (connected, publicKey) => {
        const shortAddress = publicKey
          ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
          : null;

        set({
          wallet: { connected, publicKey, shortAddress },
          zombieAssets: [],
          pointsData: null,
          scanComplete: false,
        });
      },

      setZombieAssets: (assets) => {
        set({ zombieAssets: assets, scanComplete: true });
      },

      setPointsData: (data) => {
        set({ pointsData: data });
      },

      setIsScanning: (scanning) => {
        set({ isScanning: scanning });
      },

      addToast: (message, type = 'info') => {
        const id = `${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, message, type };

        set((state) => ({
          toasts: [...state.toasts, toast],
        }));

        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      setError: (error) => {
        set({ error });
      },

      addClaimEntry: (entry) => {
        set((state) => ({
          claimHistory: [entry, ...state.claimHistory],
          lastClaimTimestamp: entry.timestamp,
        }));
      },

      markAssetsClaimed: (mints) => {
        const now = Date.now();
        set((state) => {
          const updated = { ...state.claimedAssetTimestamps };
          for (const mint of mints) {
            updated[mint] = now;
          }
          return { claimedAssetTimestamps: updated };
        });
      },

      setTorqueAuthState: (authState) => {
        set({ torqueAuthState: authState });
      },

      setTorqueProjectId: (id) => {
        set({ torqueProjectId: id });
      },

      setTorqueClaimOfferId: (id) => {
        set({ torqueClaimOfferId: id });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'zombieyield-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields — transient UI state is excluded
      partialize: (state) => ({
        claimHistory: state.claimHistory,
        lastClaimTimestamp: state.lastClaimTimestamp,
        claimedAssetTimestamps: state.claimedAssetTimestamps,
        torqueAuthState: state.torqueAuthState,
        torqueProjectId: state.torqueProjectId,
        torqueClaimOfferId: state.torqueClaimOfferId,
      }),
    }
  )
);

const CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get claimable assets — those not claimed in the last 24 hours
 */
export function getClaimableAssets(
  assets: ZombieAsset[],
  claimedTimestamps: Record<string, number>
): ZombieAsset[] {
  const now = Date.now();
  return assets.filter((asset) => {
    const lastClaimed = claimedTimestamps[asset.mint];
    if (!lastClaimed) return true; // never claimed
    return now - lastClaimed >= CLAIM_COOLDOWN_MS;
  });
}

/**
 * Get the earliest time any on-cooldown asset becomes claimable again.
 * Returns null if all assets are claimable.
 */
export function getNextClaimableTime(
  assets: ZombieAsset[],
  claimedTimestamps: Record<string, number>
): number | null {
  const now = Date.now();
  let earliest: number | null = null;

  for (const asset of assets) {
    const lastClaimed = claimedTimestamps[asset.mint];
    if (lastClaimed && now - lastClaimed < CLAIM_COOLDOWN_MS) {
      const unlocksAt = lastClaimed + CLAIM_COOLDOWN_MS;
      if (earliest === null || unlocksAt < earliest) {
        earliest = unlocksAt;
      }
    }
  }
  return earliest;
}

/**
 * Get total points claimed from history
 */
export function getTotalPointsClaimed(history: ClaimHistoryEntry[]): number {
  return history.reduce((sum, entry) => sum + entry.pointsClaimed, 0);
}

/**
 * Utility: Format wallet address
 */
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Utility: Check if address is valid Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    return address.length >= 32 && address.length <= 44;
  } catch {
    return false;
  }
}
