/**
 * useWalletConnection Hook
 * 
 * Manages wallet connection state and provides utility functions.
 * Integrates with @solana/wallet-adapter.
 */

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppStore } from '../store/appStore';

export function useWalletConnection() {
  const wallet = useWallet();
  const { setWallet, addToast } = useAppStore();
  
  // Sync wallet state with our store
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      setWallet(true, wallet.publicKey.toString());
    } else {
      setWallet(false, null);
    }
  }, [wallet.connected, wallet.publicKey, setWallet]);
  
  // Handle connection events
  useEffect(() => {
    if (wallet.connected) {
      addToast('Wallet connected!', 'success');
    }
  }, [wallet.connected, addToast]);
  
  // Handle disconnection
  useEffect(() => {
    if (!wallet.connected && wallet.publicKey === null) {
      // Only show disconnect toast if previously connected
      const wasConnected = localStorage.getItem('wallet_connected');
      if (wasConnected) {
        addToast('Wallet disconnected', 'info');
        localStorage.removeItem('wallet_connected');
      }
    }
  }, [wallet.connected, wallet.publicKey, addToast]);
  
  // Track connection state for disconnect detection
  useEffect(() => {
    if (wallet.connected) {
      localStorage.setItem('wallet_connected', 'true');
    }
  }, [wallet.connected]);
  
  return {
    wallet,
    isConnected: wallet.connected,
    publicKey: wallet.publicKey?.toString() || null,
  };
}
