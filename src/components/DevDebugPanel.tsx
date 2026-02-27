/**
 * DevDebugPanel Component
 *
 * Floating debug panel visible only in development mode.
 * Shows wallet, network, RPC, and scanner info.
 *
 * @module components/DevDebugPanel
 */

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useScanner } from '../hooks/useScanner';
import { getConnectionConfig, getNetworkColor } from '../lib/solanaConnection';
import { getAdapterInfo } from '../lib/rewards';
import { useTorque, useOffers } from '@torque-labs/react';

/**
 * Format address for display
 */
function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format timestamp
 */
function formatTime(timestamp: number | null): string {
  if (!timestamp) return 'Never';
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Dev debug panel - only renders in development
 */
export function DevDebugPanel() {
  const { connected, publicKey } = useWallet();
  const { totalFound, lastScanTime, loading, solBalance, isDevMode } = useScanner();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get connection config
  const config = getConnectionConfig();
  const networkColor = getNetworkColor(config.network);

  // Get rewards adapter info
  const adapterInfo = getAdapterInfo();

  // Torque SDK state
  const { isAuthenticated: torqueIsAuth, currentUser: torqueUser } = useTorque();
  const { data: torqueOffers } = useOffers({ status: 'ACTIVE', enabled: torqueIsAuth });
  const torqueOffersCount = torqueOffers?.length ?? 0;

  // Only render in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div
      className="
        fixed bottom-4 right-4 z-50
        bg-zombie-dark border border-zombie-green/30
        rounded-xl shadow-2xl overflow-hidden
        max-w-sm
      "
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          w-full px-4 py-3 flex items-center justify-between
          bg-zombie-dark hover:bg-zombie-gray transition-colors
        "
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🛠️</span>
          <span className="font-semibold text-white text-sm">Dev Tools</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-3 border-t border-zombie-green/20">
          {/* Network Info */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase font-semibold">Network</p>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: networkColor }}
              />
              <span className="text-sm text-white capitalize">{config.network}</span>
              {config.isCustomRpc && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                  Custom RPC
                </span>
              )}
            </div>
          </div>

          {/* RPC Endpoint */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase font-semibold">RPC Endpoint</p>
            <p className="text-xs text-gray-300 font-mono break-all">
              {config.endpoint.replace(/(api-key=)[^&]+/, '$1***')}
            </p>
          </div>

          {/* Wallet Info */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase font-semibold">Wallet</p>
            {connected && publicKey ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-white font-mono">
                  {shortenAddress(publicKey.toString())}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-sm text-gray-400">Not connected</span>
              </div>
            )}
          </div>

          {/* Scanner Info */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase font-semibold">Scanner</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-300">
                Assets: <span className="text-zombie-green font-mono">{totalFound}</span>
              </span>
              <span className="text-gray-300">
                Status: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
                  {loading ? 'Scanning...' : 'Idle'}
                </span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Last scan: {formatTime(lastScanTime)}
            </p>
            {solBalance > 0 && (
              <p className="text-xs text-gray-500">
                SOL Balance: <span className="text-white font-mono">{solBalance.toFixed(4)}</span>
              </p>
            )}
            {isDevMode && (
              <p className="text-xs text-purple-400">
                ⚡ DEV Mode Active
              </p>
            )}
          </div>

          {/* Rewards Adapter Info */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase font-semibold">Rewards</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">
                Adapter: <span className="text-white font-mono">{adapterInfo.name}</span>
              </span>
              {adapterInfo.isTorqueSDK && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                  Torque SDK
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: adapterInfo.isConfigured ? '#39ff14' : '#6b7280' }} />
              <span className="text-xs text-gray-400">
                {adapterInfo.isConfigured ? 'Configured' : 'Using mock'}
              </span>
            </div>
          </div>

          {/* Torque SDK Info */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase font-semibold">Torque SDK</p>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: torqueIsAuth ? '#39ff14' : '#6b7280' }}
              />
              <span className="text-xs text-gray-400">
                {torqueIsAuth ? 'Authenticated' : 'Not authenticated'}
              </span>
            </div>
            {torqueUser?.publicKey && (
              <p className="text-xs text-gray-500">
                User: <span className="text-white font-mono">
                  {shortenAddress(torqueUser.publicKey)}
                </span>
              </p>
            )}
            <p className="text-xs text-gray-500">
              Active offers: <span className="text-zombie-green font-mono">{torqueOffersCount}</span>
            </p>
          </div>

          {/* App Version */}
          <div className="pt-2 border-t border-zombie-green/10">
            <p className="text-xs text-gray-500">
              ZombieYield v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevDebugPanel;
