import { formatPoints } from '../lib/pointsEngine';
import type { PointsData } from '../types';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatItem({ title, value, subtitle, icon, highlight }: StatsCardProps) {
  return (
    <div
      className={`
        relative p-6 rounded-2xl border transition-all duration-300
        ${highlight 
          ? 'bg-zombie-green/10 border-zombie-green/50 shadow-neon' 
          : 'bg-zombie-gray border-zombie-green/20 hover:border-zombie-green/40'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className={`text-3xl font-bold ${highlight ? 'text-zombie-green' : 'text-white'}`}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${highlight ? 'bg-zombie-green/20' : 'bg-zombie-black'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  pointsData: PointsData | null;
  isLoading?: boolean;
}

export function StatsGrid({ pointsData, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-zombie-gray animate-pulse"
          />
        ))}
      </div>
    );
  }
  
  if (!pointsData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Connect your wallet to see your zombie stats</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatItem
        title="Total Zombie Assets"
        value={pointsData.totalZombieAssets}
        subtitle="Assets detected"
        highlight={false}
        icon={
          <svg className="w-6 h-6 text-zombie-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      />
      
      <StatItem
        title="Points Per Day"
        value={formatPoints(pointsData.pointsPerDay)}
        subtitle="Daily earnings"
        highlight
        icon={
          <svg className="w-6 h-6 text-zombie-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />
      
      <StatItem
        title="Total Points"
        value={formatPoints(pointsData.totalPointsAccumulated)}
        subtitle="All-time earnings"
        highlight={false}
        icon={
          <svg className="w-6 h-6 text-zombie-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
}
