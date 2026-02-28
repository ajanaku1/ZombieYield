/**
 * ClaimHistory Component
 *
 * Displays chronological claim history from Zustand store.
 * Shows summary stats and individual claim entries.
 *
 * @module components/ClaimHistory
 */

import { useAppStore, getTotalPointsClaimed } from '../store/appStore';
import { formatTimeAgo } from '../lib/utils';

export function ClaimHistory() {
  const { claimHistory } = useAppStore();

  if (claimHistory.length === 0) return null;

  const totalClaimed = getTotalPointsClaimed(claimHistory);
  const lastClaim = claimHistory[0];

  return (
    <div className="rounded-xl border border-zombie-green/20 bg-zombie-dark/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-zombie-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold text-white">Claim History</h3>
        <span className="px-2 py-1 text-xs rounded-lg bg-zombie-green/20 text-zombie-green">
          {claimHistory.length}
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-zombie-dark/80 p-3 text-center">
          <p className="text-xs text-gray-500">Total Claimed</p>
          <p className="text-lg font-bold text-zombie-green">{totalClaimed.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-zombie-dark/80 p-3 text-center">
          <p className="text-xs text-gray-500">Claims</p>
          <p className="text-lg font-bold text-white">{claimHistory.length}</p>
        </div>
        <div className="rounded-lg bg-zombie-dark/80 p-3 text-center">
          <p className="text-xs text-gray-500">Last Claim</p>
          <p className="text-sm font-bold text-white">{formatTimeAgo(lastClaim.timestamp)}</p>
        </div>
      </div>

      {/* Claim entries */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {claimHistory.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 rounded-lg bg-zombie-dark/80 border border-zombie-green/5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                entry.claimType === 'torque_offer' ? 'bg-blue-400' : 'bg-zombie-green'
              }`} />
              <div className="min-w-0">
                <p className="text-sm text-white truncate">
                  {entry.claimType === 'torque_offer'
                    ? entry.offerName || 'Torque Offer'
                    : 'Points Claim'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-sm font-mono text-zombie-green">
                +{entry.pointsClaimed.toLocaleString()}
              </p>
              {entry.txSignature && (
                <p className="text-xs text-gray-600 font-mono truncate max-w-[80px]" title={entry.txSignature}>
                  {entry.txSignature.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClaimHistory;
