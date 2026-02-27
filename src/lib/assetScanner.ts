/**
 * Zombie Asset Scanner (Legacy)
 *
 * Note: This file is kept for reference but is deprecated.
 * Use the useScanner hook instead for wallet scanning.
 *
 * @deprecated Use hooks/useScanner.ts instead
 */

import { PublicKey, Connection } from '@solana/web3.js';
import type { ZombieAsset } from '../types';
import { zombieTokenSet, getTokenMetadata } from '../config/zombieAllowlist';

/**
 * Scan wallet for zombie tokens (fungible)
 * @deprecated Use useScanner hook instead
 */
export async function scanZombieTokens(
  connection: Connection,
  walletAddress: string
): Promise<ZombieAsset[]> {
  const zombieAssets: ZombieAsset[] = [];

  try {
    const publicKey = new PublicKey(walletAddress);

    // Get all token accounts for the wallet
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    // Check each token account against allowlist
    for (const { account } of tokenAccounts.value) {
      const data = Buffer.from(account.data);
      const mint = new PublicKey(data.slice(0, 32)).toString();
      const amount = data.readBigUInt64LE(64);
      const decimals = data.readUInt8(44);

      if (zombieTokenSet.has(mint.toLowerCase()) && amount > 0n) {
        const metadata = getTokenMetadata(mint);
        const balance = Number(amount) / Math.pow(10, decimals);

        zombieAssets.push({
          type: 'token',
          mint,
          name: metadata?.name || 'Unknown Token',
          symbol: metadata?.symbol,
          balance,
          status: 'undead',
        });
      }
    }
  } catch (error) {
    console.error('Error scanning zombie tokens:', error);
    // Return empty array on error - graceful degradation
  }

  return zombieAssets;
}

/**
 * Full wallet scan for all zombie assets
 * @deprecated Use useScanner hook instead
 */
export async function scanWalletForZombies(
  connection: Connection,
  walletAddress: string
): Promise<ZombieAsset[]> {
  return scanZombieTokens(connection, walletAddress);
}

/**
 * Mock scanner for development/testing
 * Returns simulated zombie assets
 * @deprecated Use useScanner hook instead
 */
export function mockScanWalletForZombies(
  walletAddress: string
): ZombieAsset[] {
  // Deterministic mock based on wallet address
  const mockAssets: ZombieAsset[] = [];
  const hash = walletAddress.length;

  if (hash > 30) {
    mockAssets.push({
      type: 'token',
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      name: 'Bonk',
      symbol: 'BONK',
      balance: 1000000,
      status: 'undead',
    });
  }

  if (hash > 35) {
    mockAssets.push({
      type: 'token',
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      name: 'Jupiter',
      symbol: 'JUP',
      balance: 500,
      status: 'undead',
    });
  }

  if (hash > 40) {
    mockAssets.push({
      type: 'nft',
      mint: 'mad_lads_nft_mock_mint_address',
      name: 'Mad Lad #1337',
      status: 'undead',
    });
  }

  return mockAssets;
}
