/**
 * Solana Connection Configuration Utility
 *
 * Centralized configuration for Solana RPC connections.
 * Environment-driven configuration supporting devnet/testnet.
 *
 * Environment Variables:
 * - VITE_SOLANA_NETWORK: 'devnet' | 'testnet' | 'mainnet-beta' (default: 'devnet')
 * - VITE_SOLANA_RPC_URL: Custom RPC endpoint (optional, overrides network default)
 *
 * @module lib/solanaConnection
 */

import { clusterApiUrl } from '@solana/web3.js';

/**
 * Supported Solana networks
 */
export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';

/**
 * Connection configuration
 */
export interface ConnectionConfig {
  network: SolanaNetwork;
  endpoint: string;
  isCustomRpc: boolean;
}

/**
 * Get network from environment variable
 * Defaults to 'devnet' for safety
 */
export function getNetworkFromEnv(): SolanaNetwork {
  const envNetwork = import.meta.env.VITE_SOLANA_NETWORK;

  if (envNetwork === 'devnet' || envNetwork === 'testnet' || envNetwork === 'mainnet-beta') {
    return envNetwork;
  }

  // Default to devnet for safety
  return 'devnet';
}

/**
 * Get RPC endpoint from environment or cluster default
 */
export function getRpcEndpoint(): { endpoint: string; isCustomRpc: boolean } {
  const customRpc = import.meta.env.VITE_SOLANA_RPC_URL;

  // Use custom RPC if provided
  if (customRpc && customRpc.trim() !== '') {
    return { endpoint: customRpc.trim(), isCustomRpc: true };
  }

  // Fall back to cluster URL based on network
  const network = getNetworkFromEnv();
  return {
    endpoint: clusterApiUrl(network),
    isCustomRpc: false,
  };
}

/**
 * Get complete connection configuration
 */
export function getConnectionConfig(): ConnectionConfig {
  const network = getNetworkFromEnv();
  const { endpoint, isCustomRpc } = getRpcEndpoint();

  return {
    network,
    endpoint,
    isCustomRpc,
  };
}

/**
 * Get human-readable network name
 */
export function getNetworkDisplayName(network: SolanaNetwork): string {
  const displayNames: Record<SolanaNetwork, string> = {
    'devnet': 'Devnet',
    'testnet': 'Testnet',
    'mainnet-beta': 'Mainnet',
  };

  return displayNames[network];
}

/**
 * Get network color for UI
 */
export function getNetworkColor(network: SolanaNetwork): string {
  const colors: Record<SolanaNetwork, string> = {
    'devnet': '#39ff14',    // Green
    'testnet': '#ffff00',   // Yellow
    'mainnet-beta': '#ff4444', // Red
  };

  return colors[network];
}

/**
 * Validate RPC endpoint format
 */
export function isValidRpcUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Default configuration export
 */
export const DEFAULT_CONFIG: ConnectionConfig = {
  network: 'devnet',
  endpoint: clusterApiUrl('devnet'),
  isCustomRpc: false,
};
