/**
 * Utility Functions
 *
 * Common utility functions for formatting and display.
 *
 * @module lib/utils
 */

/**
 * Shorten a Solana address for display
 * @param address - Full address
 * @param chars - Number of characters to show on each side
 * @returns Shortened address
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a number with K/M suffixes
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

/**
 * Format time ago from timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Human-readable time ago string
 */
export function formatTimeAgo(timestamp: number | null): string {
  if (!timestamp) return '';

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Format token balance with appropriate decimals
 * @param balance - Token balance
 * @param decimals - Token decimals (default: 9)
 * @returns Formatted balance string
 */
export function formatBalance(balance: number, decimals = 9): string {
  if (balance === 0) return '0';

  // For very small balances, show more precision
  if (balance < 0.001) {
    return balance.toFixed(decimals);
  }
  if (balance < 1) {
    return balance.toFixed(4);
  }
  if (balance < 1000) {
    return balance.toFixed(2);
  }
  return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise resolving to success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a deterministic color from a string
 * @param str - Input string
 * @returns Hex color
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = (hash & 0x00ffffff).toString(16).padStart(6, '0');
  return `#${color}`;
}
