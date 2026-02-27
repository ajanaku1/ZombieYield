import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TorqueProvider } from '@torque-labs/react';
import { getConnectionConfig } from '../lib/solanaConnection';
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: ReactNode;
}

// Stable QueryClient instance (created once outside component)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

/**
 * Inner wrapper that has access to useWallet() context
 * and passes the wallet adapter to TorqueProvider.
 */
const TorqueWrapper: FC<{ endpoint: string; children: ReactNode }> = ({ endpoint, children }) => {
  const { wallet } = useWallet();

  const torqueOptions = useMemo(
    () => ({
      apiUrl: import.meta.env.VITE_TORQUE_API_URL || 'https://server.torque.so',
      rpcUrl: endpoint,
      authDomain: typeof window !== 'undefined' ? window.location.origin : 'localhost',
    }),
    [endpoint]
  );

  return (
    <TorqueProvider
      wallet={wallet?.adapter ?? null}
      options={torqueOptions}
      autoConnect={false}
    >
      {children}
    </TorqueProvider>
  );
};

/**
 * Wallet Context Provider
 *
 * Sets up Solana wallet adapters with multi-wallet support,
 * TanStack React Query, and Torque SDK provider.
 */
export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Get connection config from environment
  const { endpoint, network, isCustomRpc } = useMemo(() => getConnectionConfig(), []);

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Log network configuration in development
  if (import.meta.env.DEV) {
    console.log('[ZombieYield] Network:', network, '| RPC:', isCustomRpc ? 'Custom' : 'Cluster');
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <TorqueWrapper endpoint={endpoint}>
              {children}
            </TorqueWrapper>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
