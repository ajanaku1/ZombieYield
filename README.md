# 🧟 ZombieYield

**loyalty dashboard for Solana zombie token holders.**

Connect your wallet → scan for zombie assets → earn Torque-powered points → claim rewards.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A Solana wallet (Phantom or Solflare)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🌐 Network Configuration

ZombieYield runs on **Solana devnet by default** for safe testing.

### Environment Variables

Create `.env.local`:

```bash
# Network: devnet, testnet, or mainnet-beta
VITE_SOLANA_NETWORK=devnet

# Custom RPC endpoint (optional)
# For production, use Helius, QuickNode, or Alchemy
VITE_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
```

### Supported Networks

| Network | Default RPC | Use Case |
|---------|-------------|----------|
| `devnet` | ✅ Default | Development & Testing |
| `testnet` | Available | Staging |
| `mainnet-beta` | Available | Production (use custom RPC) |

### Production RPC Providers

For mainnet, use a paid RPC provider:

```bash
# Helius
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY

# QuickNode
VITE_SOLANA_RPC_URL=https://YOUR_ENDPOINT.quiknode.pro/YOUR_API_KEY

# Alchemy
VITE_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

---

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ZombieDashboard.tsx
│   ├── ZombieStatsCard.tsx
│   ├── ZombieAssetsTable.tsx
│   ├── ClaimButton.tsx
│   ├── DevDebugPanel.tsx   # Dev-only debug panel
│   └── ...
├── config/              # Configuration
│   └── zombieAllowlist.ts  # Token/NFT allowlist
├── hooks/               # Custom React hooks
│   ├── useScanner.ts       # Wallet scanner with caching
│   └── useWalletConnection.ts
├── lib/                 # Core logic
│   ├── pointsEngine.ts     # Torque-compatible points
│   ├── solanaConnection.ts # Network configuration
│   ├── utils.ts            # Utility functions
│   └── assetScanner.ts     # Legacy scanner
├── store/               # Zustand state
├── types/               # TypeScript types
└── views/               # Page views
```

---

## 🎯 Features

### Wallet Connection
- Multi-wallet: Phantom, Solflare
- Auto-reconnect on page refresh
- Mobile responsive wallet modal
- Network-aware (devnet/testnet/mainnet)

### Zombie Asset Detection
- Allowlist-based token detection
- O(1) lookup with Set data structure
- In-memory caching (5min TTL)
- Manual refresh capability
- Anti-abuse filtering (zero balances ignored)

### Points Engine
- Torque-compatible mock implementation
- Configurable base points (10 per asset/day)
- Multiplier support for future tiers
- Time-based accumulation
- Deterministic calculations

### Rewards Integration
- **Adapter pattern** for easy backend swapping
- Mock adapter for development
- Torque no-code integration ready
- Environment-driven configuration
- Graceful fallback if Torque not configured

### Claim UX
- Full loading/success/error states
- Toast feedback on claim
- "Rewards claimed. The undead provide."
- Auto-refresh after claim

### Dashboard UI
- Dark theme with neon green accents
- Real-time stats display
- Asset table with status badges
- Claim rewards button (mock)
- Skeleton loading states
- Empty state messaging

### Developer Tools
- Dev-only debug panel (bottom-right)
- Shows network, RPC, wallet, scanner status
- Environment-driven configuration

---

## 🎨 Design System

- **Primary Color**: Neon Green `#39ff14`
- **Background**: Deep Black `#0a0a0a`
- **Cards**: Dark Gray `#1a1a1a`
- **Border Radius**: `rounded-xl` / `rounded-2xl`
- **Effects**: Subtle glow shadows, smooth transitions

---

## 🔧 Configuration

### Adding Zombie Tokens

Edit `src/config/zombieAllowlist.ts`:

```typescript
export const ZOMBIE_TOKEN_MINTS: string[] = [
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP
  // Add more...
];
```

### Token Metadata

```typescript
export const tokenMetadata: Record<string, { symbol: string; name: string }> = {
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    symbol: 'BONK',
    name: 'Bonk',
  },
};
```

### Points Configuration

```typescript
// In src/lib/pointsEngine.ts
export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  basePointsPerAsset: 10,  // Points per asset per day
  multiplier: 1,           // Future tier multiplier
};
```

### Torque Rewards Integration

Enable Torque rewards in `.env.local`:

```bash
VITE_USE_TORQUE=true
VITE_TORQUE_API_KEY=your_api_key_here
```

The rewards adapter automatically:
- Uses Torque API when configured
- Falls back to mock if API key missing
- Handles errors gracefully

#### Adapter Architecture

```
src/lib/rewards/
├── rewardsAdapter.ts      # Interface definition
├── mockRewardsAdapter.ts  # Local mock implementation
├── torqueRewardsAdapter.ts # Torque API implementation
└── index.ts               # Adapter selector
```

To use in components:

```typescript
import { rewardsClient } from '@/lib/rewards';

const points = await rewardsClient.getUserPoints(wallet, count, connectedAt);
await rewardsClient.claimRewards(wallet);
```

---

## 🧪 Development

### Dev Debug Panel

In development mode, a debug panel appears at bottom-right showing:
- Current network (devnet/testnet/mainnet)
- RPC endpoint (API keys masked)
- Connected wallet address
- Scanner status and last scan time
- App version

### Using Testnet

```bash
# .env.local
VITE_SOLANA_NETWORK=testnet
```

### Testing with Devnet Tokens

1. Get devnet SOL from faucet
2. Get devnet tokens (BONK, etc.)
3. Connect wallet to ZombieYield
4. Scanner will detect allowlisted tokens

---

## 📊 Performance

- **O(1) allowlist lookups** via Set data structure
- **In-memory caching** with 5-minute TTL
- **Debounced scanning** (1s delay)
- **RPC timeout protection** (10s)
- **No duplicate scans** per session
- **Memoized calculations** to prevent re-renders

---

## 🛡 Security & Anti-Abuse

Current protections:
- Zero-balance tokens filtered
- RPC timeout handling
- 403 error handling
- Graceful degradation on errors

Future enhancements:
- Frozen account detection
- Anti-sybil logic
- Rate limiting per wallet

---

## 🚧 Roadmap

- [ ] Real Torque API integration
- [ ] Actual claim functionality
- [ ] NFT collection detection via Metaplex
- [ ] Historical points chart
- [ ] Leaderboard
- [ ] Multi-chain support

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- Built with [@solana/wallet-adapter](https://github.com/solana-labs/wallet-adapter)
- Powered by [Torque](https://torque.so)
- UI inspired by degen culture 🧟

---

**Made with 💚 by the ZombieYield team**
