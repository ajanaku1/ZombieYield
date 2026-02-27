import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * Header Component
 * 
 * Displays the ZombieYield logo and wallet connection button.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zombie-green/20 bg-zombie-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-zombie-green/20 flex items-center justify-center border border-zombie-green/50">
                <span className="text-2xl">🧟</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-zombie-green rounded-full shadow-neon" />
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Zombie<span className="text-zombie-green text-glow">Yield</span>
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Rewards for holding zombie assets
              </p>
            </div>
          </div>
          
          {/* Wallet Button */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
