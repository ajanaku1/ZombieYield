/**
 * ZombieYield Allowlist Configuration
 *
 * Scalable allowlist for zombie tokens and NFT collections.
 * Optimized with Sets for O(1) lookup performance.
 *
 * @module config/zombieAllowlist
 */

/**
 * Allowlisted zombie token mint addresses
 * Add token mints here to include them in zombie detection
 */
export const ZOMBIE_TOKEN_MINTS: string[] = [
  // Meme tokens
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', // POPCAT
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', // RNDR

  // Add more token mints as needed...
  // Format: 'MINT_ADDRESS', // SYMBOL
];

/**
 * Allowlisted NFT collection identifiers
 * Add collection names/identifiers here
 */
export const ZOMBIE_NFT_COLLECTIONS: string[] = [
  'mad_lads',
  'okay_bears',
  'degods',
  'solana_monkey_business',
  'famous_fox_federation',
  'howload_monkey',
  'howloud_monkey',

  // Add more collections as needed...
];

/**
 * Main allowlist object
 */
export const zombieAllowlist = {
  tokens: ZOMBIE_TOKEN_MINTS,
  nftCollections: ZOMBIE_NFT_COLLECTIONS,
};

/**
 * Optimized Sets for O(1) lookup
 * Created once at module load for maximum performance
 */
export const zombieTokenSet = new Set(
  ZOMBIE_TOKEN_MINTS.map((mint) => mint.toLowerCase())
);

export const zombieNftCollectionSet = new Set(
  ZOMBIE_NFT_COLLECTIONS.map((id) => id.toLowerCase())
);

/**
 * Token metadata lookup map for quick access
 */
export const tokenMetadata: Record<string, { symbol: string; name: string }> = {
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    symbol: 'BONK',
    name: 'Bonk',
  },
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': {
    symbol: 'POPCAT',
    name: 'Popcat',
  },
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': {
    symbol: 'WIF',
    name: 'dogwifhat',
  },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': {
    symbol: 'JUP',
    name: 'Jupiter',
  },
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': {
    symbol: 'RNDR',
    name: 'Render Token',
  },
};

/**
 * Collection metadata lookup map
 */
export const collectionMetadata: Record<string, { name: string }> = {
  mad_lads: { name: 'Mad Lads' },
  okay_bears: { name: 'Okay Bears' },
  degods: { name: 'DeGods' },
  solana_monkey_business: { name: 'Solana Monkey Business' },
  famous_fox_federation: { name: 'Famous Fox Federation' },
  howload_monkey: { name: 'Howload Monkey' },
  howloud_monkey: { name: 'Howloud! Monkey' },
};

/**
 * Check if a token mint is in the allowlist
 * @param mint - Token mint address
 * @returns true if zombie token
 */
export function isZombieToken(mint: string): boolean {
  return zombieTokenSet.has(mint.toLowerCase());
}

/**
 * Check if an NFT collection is in the allowlist
 * @param identifier - Collection identifier
 * @returns true if zombie NFT collection
 */
export function isZombieNftCollection(identifier: string): boolean {
  return zombieNftCollectionSet.has(identifier.toLowerCase());
}

/**
 * Get token metadata
 * @param mint - Token mint address
 * @returns Token metadata or undefined
 */
export function getTokenMetadata(
  mint: string
): { symbol: string; name: string } | undefined {
  return tokenMetadata[mint.toLowerCase()];
}

/**
 * Get collection metadata
 * @param identifier - Collection identifier
 * @returns Collection metadata or undefined
 */
export function getCollectionMetadata(
  identifier: string
): { name: string } | undefined {
  return collectionMetadata[identifier.toLowerCase()];
}

/**
 * Points configuration constants
 */
export const POINTS_PER_TOKEN_PER_DAY = 10;
export const POINTS_PER_NFT_PER_DAY = 10;
