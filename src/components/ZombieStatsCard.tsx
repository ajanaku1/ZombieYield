/**
 * ZombieStatsCard Component
 *
 * Displays zombie asset statistics including:
 * - Total Zombie Assets
 * - Points Per Day
 * - Total Points
 *
 * @module components/ZombieStatsCard
 */

import { formatPoints } from '../lib/pointsEngine';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  loading?: boolean;
}

/**
 * Individual stat card component
 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        className="
          p-6 rounded-xl border border-zombie-green/20
          bg-zombie-gray animate-pulse min-h-[140px]
        "
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-zombie-dark rounded w-24" />
            <div className="h-8 bg-zombie-dark rounded w-32" />
            {subtitle && (
              <div className="h-3 bg-zombie-dark rounded w-20" />
            )}
          </div>
          <div className="w-12 h-12 bg-zombie-dark rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        p-6 rounded-xl border transition-all duration-300
        ${
          highlight
            ? 'bg-zombie-green/10 border-zombie-green/50 shadow-neon'
            : 'bg-zombie-gray border-zombie-green/20 hover:border-zombie-green/40'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p
            className={`text-3xl font-bold ${
              highlight ? 'text-zombie-green' : 'text-white'
            }`}
          >
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-xl ${
            highlight ? 'bg-zombie-green/20' : 'bg-zombie-black'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/**
 * Stats grid props
 */
interface ZombieStatsCardProps {
  totalAssets: number;
  pointsPerDay: number;
  totalPoints: number;
  loading?: boolean;
}

/**
 * Main stats card component
 */
export function ZombieStatsCard({
  totalAssets,
  pointsPerDay,
  totalPoints,
  loading = false,
}: ZombieStatsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Zombie Assets"
        value={loading ? '...' : totalAssets}
        subtitle="Assets detected"
        loading={loading}
        icon={
          <svg
            className="w-6 h-6 text-zombie-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        }
      />

      <StatCard
        title="Points Per Day"
        value={loading ? '...' : formatPoints(pointsPerDay)}
        subtitle="Daily earnings"
        highlight
        loading={loading}
        icon={
          <svg
            className="w-6 h-6 text-zombie-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        }
      />

      <StatCard
        title="Total Points"
        value={loading ? '...' : formatPoints(totalPoints)}
        subtitle="All-time earnings"
        loading={loading}
        icon={
          <svg
            className="w-6 h-6 text-zombie-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
}

export default ZombieStatsCard;
