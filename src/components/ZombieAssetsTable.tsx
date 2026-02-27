/**
 * ZombieAssetsTable Component
 *
 * Displays detected zombie assets in a clean table format.
 * Shows mint address, type, and status badge.
 *
 * @module components/ZombieAssetsTable
 */

import type { ZombieAsset } from '../types';

/**
 * Shorten a Solana address for display
 */
function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Table row props
 */
interface AssetRowProps {
  asset: ZombieAsset;
}

/**
 * Individual asset row component
 */
function AssetRow({ asset }: AssetRowProps) {
  return (
    <tr
      className="
        border-b border-zombie-green/10
        hover:bg-zombie-green/5 transition-colors
      "
    >
      {/* Mint Address */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {/* Asset Icon */}
          <div
            className="
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-zombie-green/10 border border-zombie-green/20
            "
          >
            {asset.type === 'token' ? (
              <span className="text-lg">💰</span>
            ) : (
              <span className="text-lg">🖼️</span>
            )}
          </div>

          {/* Asset Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {asset.symbol || asset.name}
              </span>
              <span
                className="
                  px-2 py-0.5 text-xs rounded-full
                  bg-zombie-green/20 text-zombie-green
                  border border-zombie-green/30
                "
              >
                {asset.type.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              {shortenAddress(asset.mint)}
            </p>
          </div>
        </div>
      </td>

      {/* Balance (tokens only) */}
      <td className="py-4 px-4">
        {asset.type === 'token' && asset.balance !== undefined ? (
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {asset.balance.toLocaleString()}
            </p>
            {asset.symbol && (
              <p className="text-xs text-gray-500">{asset.symbol}</p>
            )}
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>

      {/* Status Badge */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 justify-end">
          {/* Pulsing indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="
                animate-ping absolute inline-flex h-full w-full
                rounded-full bg-zombie-green opacity-75
              "
            />
            <span
              className="
                relative inline-flex rounded-full h-2.5 w-2.5
                bg-zombie-green
              "
            />
          </span>
          <span className="text-sm text-zombie-green font-medium">Undead</span>
        </div>
      </td>
    </tr>
  );
}

/**
 * Table props
 */
interface ZombieAssetsTableProps {
  assets: ZombieAsset[];
  loading?: boolean;
}

/**
 * Main table component
 */
export function ZombieAssetsTable({ assets, loading = false }: ZombieAssetsTableProps) {
  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-zombie-gray rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no assets found
  if (assets.length === 0) {
    return (
      <div
        className="
          rounded-xl border border-zombie-green/20
          bg-zombie-dark/50 p-12 text-center
        "
      >
        <div
          className="
            w-16 h-16 mx-auto mb-4 rounded-2xl
            bg-zombie-green/10 flex items-center justify-center
          "
        >
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Zombie Assets Detected
        </h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          This wallet doesn't contain any allowlisted zombie tokens or NFTs… yet.
          Connect another wallet or acquire zombie assets to start earning!
        </p>
      </div>
    );
  }

  // Table with data
  return (
    <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zombie-green/20 bg-zombie-black/50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                Asset
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                Balance
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <AssetRow key={`${asset.mint}-${index}`} asset={asset} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ZombieAssetsTable;
