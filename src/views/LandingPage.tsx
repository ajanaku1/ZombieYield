/**
 * LandingPage
 *
 * Multi-section marketing page for ZombieYield.
 * Hero + Features + How It Works + CTA.
 * "Launch App" opens the dashboard in a new tab.
 */

const APP_URL = '#/app';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zombie-black text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-zombie-green/10 bg-zombie-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-zombie-green/20 flex items-center justify-center border border-zombie-green/50">
                <span className="text-2xl">🧟</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-zombie-green rounded-full" style={{ boxShadow: '0 0 8px rgba(57,255,20,0.6)' }} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Zombie<span className="text-zombie-green" style={{ textShadow: '0 0 10px rgba(57,255,20,0.5)' }}>Yield</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#/video" className="text-sm text-gray-400 hover:text-white transition-colors duration-150 hidden sm:block">
              Video
            </a>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-zombie-green text-zombie-black font-bold text-sm transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zombie-green"
              style={{ boxShadow: '0 0 20px rgba(57,255,20,0.3)' }}
            >
              Launch App
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.15) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zombie-green/30 bg-zombie-green/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-zombie-green animate-pulse" />
            <span className="text-sm text-zombie-green font-medium">Built on Solana &middot; Powered by Torque</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Resurrect Your<br />
            <span className="text-zombie-green" style={{ textShadow: '0 0 30px rgba(57,255,20,0.4)' }}>Dead Tokens</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Turn forgotten meme coins and abandoned NFTs into daily yield.
            ZombieYield scans your wallet, detects zombie assets, and lets you
            earn points just for holding them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-zombie-green text-zombie-black font-bold text-lg transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zombie-green"
              style={{ boxShadow: '0 0 30px rgba(57,255,20,0.4)' }}
            >
              Launch App
            </a>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl border border-zombie-green/30 text-zombie-green font-semibold text-lg transition-colors duration-150 ease-out hover:bg-zombie-green/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zombie-green"
            >
              How It Works
            </a>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '10+', label: 'Zombie Tokens' },
              { value: '24hr', label: 'Claim Cycle' },
              { value: 'Free', label: 'To Use' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-zombie-green">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-zombie-green/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Dead bags? <span className="text-zombie-green">Make them work.</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              ZombieYield turns your forgotten Solana assets into a passive yield engine.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Wallet Scanner',
                desc: 'Automatically detects zombie tokens and NFTs in your connected wallet using an on-chain allowlist.',
              },
              {
                icon: '⚡',
                title: 'Daily Points',
                desc: 'Earn 10+ points per zombie asset per day. Higher-value categories like dead project tokens earn more.',
              },
              {
                icon: '🏆',
                title: 'Tier System',
                desc: 'Progress from Rookie to Legend as you accumulate points. Each tier unlocks better multipliers.',
              },
              {
                icon: '🔗',
                title: 'Torque Integration',
                desc: 'Real Torque SDK integration — accept campaigns, complete journeys, and earn on-chain rewards.',
              },
              {
                icon: '🛡️',
                title: 'Smart Scoring',
                desc: 'Category-aware scoring: dust tokens, dormant holdings, abandoned NFTs, and dead projects each have unique rates.',
              },
              {
                icon: '📊',
                title: 'Claim History',
                desc: 'Full persistent claim history with 24hr cooldown. Track every claim across sessions.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zombie-green/15 bg-zombie-dark/60 p-6 transition-colors duration-150 ease-out hover:border-zombie-green/30"
              >
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t border-zombie-green/10 bg-zombie-dark/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="text-zombie-green">Works</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect Wallet', desc: 'Link your Phantom or Solflare wallet to get started.' },
              { step: '02', title: 'Scan Assets', desc: 'We detect zombie tokens and NFTs against our allowlist.' },
              { step: '03', title: 'Earn Points', desc: 'Points accrue daily based on asset category and score.' },
              { step: '04', title: 'Claim Daily', desc: 'Claim your accumulated points once every 24 hours.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-zombie-green/10 border border-zombie-green/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-zombie-green font-bold text-lg font-mono">{item.step}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-zombie-green/10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-zombie-green/10 border border-zombie-green/30 flex items-center justify-center mx-auto mb-8" style={{ boxShadow: '0 0 40px rgba(57,255,20,0.15)' }}>
            <span className="text-4xl">🧟</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to earn from your <span className="text-zombie-green">dead bags</span>?
          </h2>
          <p className="text-gray-400 mb-8">
            Connect your wallet and start earning in under a minute.
          </p>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-xl bg-zombie-green text-zombie-black font-bold text-lg transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zombie-green"
            style={{ boxShadow: '0 0 30px rgba(57,255,20,0.4)' }}
          >
            Launch App
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zombie-green/10 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; 2026 ZombieYield. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#/video" className="hover:text-white transition-colors duration-150">Video</a>
            <span className="hidden sm:inline">&middot;</span>
            <a href="https://github.com/ajanaku1/ZombieYield" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-150">GitHub</a>
            <span className="hidden sm:inline">&middot;</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Solana Network
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
