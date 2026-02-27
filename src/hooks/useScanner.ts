/**
 * useScanner Hook
 *
 * Scans connected wallet for zombie assets (tokens and NFTs).
 * Features:
 * - In-memory caching by wallet address + network
 * - Runs only on wallet connect/change
 * - Manual refetch capability
 * - Anti-abuse filtering (ignores zero balances, frozen accounts)
 * - Debounced to prevent RPC spam
 *
 * @module hooks/useScanner
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import type { ZombieAsset } from '../types';
import {
  zombieTokenSet,
  getTokenMetadata,
} from '../config/zombieAllowlist';
import { getNetworkFromEnv } from '../lib/solanaConnection';
import { getMockAssetsForBalance, isDevModeEnabled, DEV_MODE_CONFIG } from '../lib/devModeAssets';

/**
 * Debounce delay in milliseconds
 */
const SCAN_DEBOUNCE_MS = 1000;

/**
 * RPC request timeout in milliseconds
 */
const RPC_TIMEOUT_MS = 10000;

/**
 * Cache entry for scan results
 */
interface ScanCacheEntry {
  assets: ZombieAsset[];
  timestamp: number;
  network: string;
}

/**
 * In-memory cache keyed by wallet address
 */
const scanCache = new Map<string, ScanCacheEntry>();

/**
 * Cache TTL - 5 minutes
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Parse SPL token account data
 */
function parseTokenAccountData(data: Buffer): {
  mint: PublicKey;
  amount: bigint;
  decimals: number;
} {
  const mint = new PublicKey(data.slice(0, 32));
  const amount = data.readBigUInt64LE(64);
  const decimals = data.readUInt8(44);

  return { mint, amount, decimals };
}

/**
 * Fetch wallet SOL balance
 */
async function getSolBalance(
  connection: any,
  publicKey: PublicKey
): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('[Scanner] Failed to fetch SOL balance:', error);
    return 0;
  }
}

/**
 * DEV MODE: Inject mock assets based on SOL balance
 * This allows demo/testing without real zombie assets
 */
async function injectDevModeAssets(
  connection: any,
  publicKey: PublicKey,
  realAssets: ZombieAsset[]
): Promise<{
  assets: ZombieAsset[];
  solBalance: number;
  isDevMode: boolean;
}> {
  // Only inject in development mode
  if (!isDevModeEnabled()) {
    return { assets: realAssets, solBalance: 0, isDevMode: false };
  }

  // Fetch SOL balance
  const solBalance = await getSolBalance(connection, publicKey);

  if (DEV_MODE_CONFIG.logToConsole) {
    console.log('[DEV MODE] Wallet SOL Balance:', solBalance);
  }

  // Get mock assets based on balance tier
  const mockAssets = getMockAssetsForBalance(solBalance);

  if (DEV_MODE_CONFIG.logToConsole) {
    console.log('[DEV MODE] Injected mock assets:', mockAssets.length);
    if (mockAssets.length > 0) {
      console.log('[DEV MODE] Mock assets:', mockAssets.map(a => ({
        name: a.name,
        type: a.type,
        balance: a.balance,
      })));
    }
  }

  // Combine real assets with mock assets (real assets take priority)
  const combinedAssets = [...realAssets];

  // Add mock assets that aren't already in real assets
  for (const mockAsset of mockAssets) {
    const alreadyExists = combinedAssets.some(
      (a) => a.mint === mockAsset.mint && a.type === mockAsset.type
    );
    if (!alreadyExists) {
      combinedAssets.push(mockAsset);
    }
  }

  return {
    assets: combinedAssets,
    solBalance,
    isDevMode: true,
  };
}

/**
 * Metaplex Token Metadata Program ID
 */
const METAPLEX_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

/**
 * Find metadata PDA for a mint
 */
function findMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METAPLEX_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METAPLEX_METADATA_PROGRAM_ID
  );
  return pda;
}

/**
 * Parse Metaplex metadata account
 */
function parseMetadata(data: Buffer): {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators?: Array<{ address: PublicKey; verified: boolean; share: number }>;
  collection?: { key: PublicKey; verified: boolean };
} {
  // Skip key (1 byte) and update auth (32 bytes)
  let offset = 33;

  // Read name (string with 4-byte length prefix)
  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const name = data.slice(offset, offset + nameLen).toString('utf8').replace(/\u0000/g, '');
  offset += nameLen;

  // Read symbol
  const symbolLen = data.readUInt32LE(offset);
  offset += 4;
  const symbol = data.slice(offset, offset + symbolLen).toString('utf8').replace(/\u0000/g, '');
  offset += symbolLen;

  // Read URI
  const uriLen = data.readUInt32LE(offset);
  offset += 4;
  const uri = data.slice(offset, offset + uriLen).toString('utf8').replace(/\u0000/g, '');
  offset += uriLen;

  // Seller fee basis points
  const sellerFeeBasisPoints = data.readUInt16LE(offset);
  offset += 2;

  // Creators (optional)
  const hasCreators = data.readUInt8(offset);
  offset += 1;

  let creators;
  if (hasCreators) {
    const creatorCount = data.readUInt32LE(offset);
    offset += 4;
    creators = [];
    for (let i = 0; i < creatorCount; i++) {
      const address = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;
      const verified = data.readUInt8(offset) === 1;
      offset += 1;
      const share = data.readUInt8(offset);
      offset += 1;
      creators.push({ address, verified, share });
    }
  }

  // Collection (optional, after creators)
  const hasCollection = data.readUInt8(offset);
  offset += 1;

  let collection;
  if (hasCollection) {
    const verified = data.readUInt8(offset) === 1;
    offset += 1;
    const key = new PublicKey(data.slice(offset, offset + 32));
    collection = { key, verified };
  }

  return {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints,
    creators,
    collection,
  };
}

/**
 * Scan wallet for NFTs and check against allowlist
 */
async function scanNfts(
  connection: any,
  publicKey: PublicKey
): Promise<ZombieAsset[]> {
  const zombieNfts: ZombieAsset[] = [];

  try {
    // Get all token accounts (NFTs have amount = 1)
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    if (import.meta.env.DEV) {
      console.log('[Scanner] Found', tokenAccounts.value.length, 'token accounts');
    }

    // Collect NFT mints (amount === 1)
    const nftMints: PublicKey[] = [];
    for (const { account } of tokenAccounts.value) {
      const data = Buffer.from(account.data);
      const amount = data.readBigUInt64LE(64);
      
      if (amount === 1n) {
        const mint = new PublicKey(data.slice(0, 32));
        nftMints.push(mint);
      }
    }

    if (import.meta.env.DEV) {
      console.log('[Scanner] Found', nftMints.length, 'potential NFTs');
    }

    if (nftMints.length === 0) {
      return [];
    }

    // Fetch metadata for all NFTs
    const metadataPromises = nftMints.map(async (mint) => {
      const metadataPda = findMetadataPda(mint);
      try {
        const metadataAccount = await connection.getAccountInfo(metadataPda);
        if (metadataAccount) {
          const metadata = parseMetadata(Buffer.from(metadataAccount.data));
          if (import.meta.env.DEV) {
            console.log('[Scanner] NFT Metadata for', mint.toString().slice(0, 8) + '...', {
              name: metadata.name,
              symbol: metadata.symbol,
            });
          }
          return { mint, metadata };
        } else {
          if (import.meta.env.DEV) {
            console.log('[Scanner] No metadata found for', mint.toString().slice(0, 8) + '...');
          }
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[Scanner] Failed to fetch metadata for mint:', mint.toString().slice(0, 8) + '...', e);
        }
      }
      return null;
    });

    const metadataResults = await Promise.all(metadataPromises);

    if (import.meta.env.DEV) {
      console.log('[Scanner] Got metadata for', metadataResults.filter(r => r !== null).length, 'NFTs');
    }

    // Check each NFT against allowlist
    for (const result of metadataResults) {
      if (!result) continue;

      const { mint, metadata } = result;
      const nameLower = metadata.name.toLowerCase();

      if (import.meta.env.DEV) {
        console.log('[Scanner] Checking NFT:', metadata.name, '(lowercase:', nameLower, ')');
      }

      // Check for Howload/Howloud monkeys by name pattern
      if (nameLower.includes('howload')) {
        if (import.meta.env.DEV) {
          console.log('[Scanner] MATCH: Howload Monkey detected!');
        }
        zombieNfts.push({
          type: 'nft',
          mint: mint.toString(),
          name: 'Howload Monkey',
          symbol: metadata.symbol || 'NFT',
          status: 'undead',
        });
      } else if (nameLower.includes('howloud')) {
        if (import.meta.env.DEV) {
          console.log('[Scanner] MATCH: Howloud Monkey detected!');
        }
        zombieNfts.push({
          type: 'nft',
          mint: mint.toString(),
          name: 'Howloud! Monkey',
          symbol: metadata.symbol || 'NFT',
          status: 'undead',
        });
      }
    }

    if (import.meta.env.DEV) {
      console.log('[Scanner] Total zombie NFTs found:', zombieNfts.length);
    }
  } catch (error) {
    console.error('[Scanner] NFT scan error:', error);
  }

  return zombieNfts;
}

/**
 * Check if token account should be filtered out (anti-abuse)
 */
function shouldFilterToken(
  amount: bigint,
  _mint: PublicKey,
  _data: Buffer
): boolean {
  // Filter zero balances
  if (amount === 0n) return true;
  return false;
}

/**
 * Fetch token accounts with timeout handling
 */
async function fetchTokenAccountsWithTimeout(
  connection: any,
  publicKey: PublicKey,
  timeoutMs: number
): Promise<any> {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('RPC request timed out')), timeoutMs);
  });

  try {
    const fetchPromise = connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error: any) {
    if (error?.message?.includes('403') || error?.message?.includes('forbidden')) {
      throw new Error('RPC access denied. Please check your RPC endpoint.');
    }
    if (error?.message?.includes('timed out')) {
      throw new Error('RPC request timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Scanner result type
 */
export interface ScannerResult {
  loading: boolean;
  zombieAssets: ZombieAsset[];
  totalFound: number;
  error: string | null;
  scanComplete: boolean;
  refetch: () => Promise<void>;
  lastScanTime: number | null;
  solBalance: number;
  isDevMode: boolean;
}

/**
 * Main scanner hook
 */
export function useScanner(): ScannerResult {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const currentNetwork = useMemo(() => getNetworkFromEnv(), []);

  const [loading, setLoading] = useState(false);
  const [zombieAssets, setZombieAssets] = useState<ZombieAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);

  // Refs for debouncing and preventing duplicate scans
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedWalletRef = useRef<string | null>(null);
  const isScanningRef = useRef(false);

  /**
   * Get cached result if valid
   */
  const getCachedResult = useCallback((walletAddress: string): ZombieAsset[] | null => {
    const entry = scanCache.get(walletAddress);
    if (!entry) return null;

    // Check cache is for current network
    if (entry.network !== currentNetwork) return null;

    // Check cache hasn't expired
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      scanCache.delete(walletAddress);
      return null;
    }

    return entry.assets;
  }, [currentNetwork]);

  /**
   * Cache scan result
   */
  const cacheResult = useCallback((walletAddress: string, assets: ZombieAsset[]) => {
    scanCache.set(walletAddress, {
      assets,
      timestamp: Date.now(),
      network: currentNetwork,
    });
  }, [currentNetwork]);

  /**
   * Scan wallet for zombie assets
   */
  const scanWallet = useCallback(async () => {
    if (!publicKey || !connected || isScanningRef.current) {
      return;
    }

    const walletAddress = publicKey.toString();

    // Check cache first
    const cached = getCachedResult(walletAddress);
    if (cached !== null && scanComplete) {
      if (import.meta.env.DEV) {
        console.log('[Scanner] Using cached result for', walletAddress.slice(0, 8));
      }
      return;
    }

    isScanningRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const assets: ZombieAsset[] = [];

      // Scan for zombie tokens
      const tokenAccounts = await fetchTokenAccountsWithTimeout(
        connection,
        publicKey,
        RPC_TIMEOUT_MS
      );

      for (const { account } of tokenAccounts.value) {
        const data = Buffer.from(account.data);
        const { mint, amount, decimals } = parseTokenAccountData(data);

        const mintAddress = mint.toString();

        // Anti-abuse: filter unwanted tokens
        if (shouldFilterToken(amount, mint, data)) {
          continue;
        }

        // Check if token is in zombie allowlist
        if (zombieTokenSet.has(mintAddress.toLowerCase()) && amount > 0n) {
          const metadata = getTokenMetadata(mintAddress);
          const balance = Number(amount) / Math.pow(10, decimals);

          assets.push({
            type: 'token',
            mint: mintAddress,
            name: metadata?.name || 'Unknown Token',
            symbol: metadata?.symbol,
            balance,
            status: 'undead',
          });
        }
      }

      // Scan for zombie NFTs
      if (import.meta.env.DEV) {
        console.log('[Scanner] Scanning for NFTs...');
      }
      const nftAssets = await scanNfts(connection, publicKey);
      assets.push(...nftAssets);

      // DEV MODE: Inject mock assets based on SOL balance
      const { assets: combinedAssets, solBalance: balance, isDevMode: devMode } = 
        await injectDevModeAssets(connection, publicKey, assets);

      setZombieAssets(combinedAssets);
      setSolBalance(balance);
      setIsDevMode(devMode);
      setScanComplete(true);
      setLastScanTime(Date.now());
      lastScannedWalletRef.current = walletAddress;

      // Cache the result (only cache real assets, not mock)
      cacheResult(walletAddress, assets);

      if (import.meta.env.DEV) {
        console.log('[Scanner] Found', combinedAssets.length, 'zombie assets:', {
          real: assets.length,
          mock: combinedAssets.length - assets.length,
          tokens: combinedAssets.filter(a => a.type === 'token').length,
          nfts: combinedAssets.filter(a => a.type === 'nft').length,
        });
      }
    } catch (err) {
      console.error('[Scanner] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan wallet');
      setScanComplete(true);
    } finally {
      setLoading(false);
      isScanningRef.current = false;
    }
  }, [connection, publicKey, connected, scanComplete, getCachedResult, cacheResult]);

  /**
   * Manual refetch - bypasses cache
   */
  const refetch = useCallback(async () => {
    if (!publicKey || !connected || isScanningRef.current) {
      return;
    }

    const walletAddress = publicKey.toString();

    // Clear cache for this wallet
    scanCache.delete(walletAddress);
    setScanComplete(false);
    lastScannedWalletRef.current = null;

    // Force a fresh scan
    isScanningRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const tokenAccounts = await fetchTokenAccountsWithTimeout(
        connection,
        publicKey,
        RPC_TIMEOUT_MS
      );

      const assets: ZombieAsset[] = [];

      for (const { account } of tokenAccounts.value) {
        const data = Buffer.from(account.data);
        const { mint, amount, decimals } = parseTokenAccountData(data);
        const mintAddress = mint.toString();

        if (shouldFilterToken(amount, mint, data)) continue;

        if (zombieTokenSet.has(mintAddress.toLowerCase()) && amount > 0n) {
          const metadata = getTokenMetadata(mintAddress);
          const balance = Number(amount) / Math.pow(10, decimals);

          assets.push({
            type: 'token',
            mint: mintAddress,
            name: metadata?.name || 'Unknown Token',
            symbol: metadata?.symbol,
            balance,
            status: 'undead',
          });
        }
      }

      setZombieAssets(assets);
      setScanComplete(true);
      setLastScanTime(Date.now());
      lastScannedWalletRef.current = walletAddress;
      cacheResult(walletAddress, assets);
    } catch (err) {
      console.error('[Scanner] Refetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan wallet');
      setScanComplete(true);
    } finally {
      setLoading(false);
      isScanningRef.current = false;
    }
  }, [connection, publicKey, connected, cacheResult]);

  /**
   * Trigger scan when wallet connects
   */
  useEffect(() => {
    if (!connected || !publicKey) {
      setZombieAssets([]);
      setScanComplete(false);
      setLastScanTime(null);
      lastScannedWalletRef.current = null;
      return;
    }

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    scanTimeoutRef.current = setTimeout(() => {
      scanWallet();
    }, SCAN_DEBOUNCE_MS);

    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [connected, publicKey, scanWallet]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  return {
    loading,
    zombieAssets,
    totalFound: zombieAssets.length,
    error,
    scanComplete,
    refetch,
    lastScanTime,
    solBalance,
    isDevMode,
  };
}

export default useScanner;
