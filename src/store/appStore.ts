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
        torqueProjectId: state.torqueProjectId,
        torqueClaimOfferId: state.torqueClaimOfferId,
      }),
    }
  )
);

/**
 * Get total points claimed from history
 */
export function getTotalPointsClaimed(history: ClaimHistoryEntry[]): number {
  return history.reduce((sum, entry) => sum + entry.pointsClaimed, 0);
}
