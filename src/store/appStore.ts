/**
 * ZombieYield Store
 * 
 * Centralized state management using Zustand.
 * Handles wallet state, zombie assets, points, and UI state.
 */

import { create } from 'zustand';
import type { ZombieAsset, PointsData, Toast } from '../types';

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
  reset: () => void;
}

const initialState = {
  wallet: {
    connected: false,
    publicKey: null,
    shortAddress: null,
  },
  zombieAssets: [],
  isScanning: false,
  scanComplete: false,
  pointsData: null,
  toasts: [],
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  
  setWallet: (connected, publicKey) => {
    const shortAddress = publicKey
      ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
      : null;
    
    set({
      wallet: { connected, publicKey, shortAddress },
      // Reset assets and points when wallet changes
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
    
    // Auto-remove after 5 seconds
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
  
  reset: () => {
    set(initialState);
  },
}));

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
    // Basic length check - Solana addresses are 32-44 chars
    return address.length >= 32 && address.length <= 44;
  } catch {
    return false;
  }
}
