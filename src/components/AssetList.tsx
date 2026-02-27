import type { ZombieAsset } from '../types';

interface AssetListProps {
  assets: ZombieAsset[];
  isLoading?: boolean;
}

function AssetRow({ asset }: { asset: ZombieAsset }) {
  return (
    <div
      className="
        flex items-center justify-between p-4 rounded-xl
        bg-zombie-gray/50 border border-zombie-green/10
        hover:border-zombie-green/30 transition-all duration-200
      "
    >
      <div className="flex items-center gap-4">
        {/* Asset Icon */}
        <div className="w-12 h-12 rounded-xl bg-zombie-green/10 flex items-center justify-center border border-zombie-green/20">
          {asset.type === 'token' ? (
            <span className="text-xl">💰</span>
          ) : (
            <span className="text-xl">🖼️</span>
          )}
        </div>
        
        {/* Asset Info */}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white">
              {asset.symbol || asset.name}
            </p>
            <span className="px-2 py-0.5 text-xs rounded-full bg-zombie-green/20 text-zombie-green border border-zombie-green/30">
              {asset.type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">
            {asset.name}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Balance */}
        {asset.balance !== undefined && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">
              {asset.balance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{asset.symbol}</p>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zombie-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-zombie-green"></span>
          </span>
          <span className="text-sm text-zombie-green font-medium">Undead</span>
        </div>
      </div>
    </div>
  );
}

export function AssetList({ assets, isLoading }: AssetListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-zombie-gray animate-pulse"
          />
        ))}
      </div>
    );
  }
  
  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zombie-green/10 flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Zombie Assets Found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          This wallet doesn't contain any allowlisted zombie tokens or NFTs.
          Connect another wallet or acquire some zombie assets to start earning!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {assets.map((asset, index) => (
        <AssetRow key={`${asset.mint}-${index}`} asset={asset} />
      ))}
    </div>
  );
}
