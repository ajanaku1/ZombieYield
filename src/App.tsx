import { Header } from './components/Header';
import { Dashboard } from './views/Dashboard';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WalletContextProvider } from './components/WalletContextProvider';
import { DevDebugPanel } from './components/DevDebugPanel';

function App() {
  return (
    <ErrorBoundary>
      <WalletContextProvider>
        <div className="min-h-screen bg-zombie-black">
          <ToastContainer />
          <Header />
          <main>
            <Dashboard />
          </main>

          {/* Footer */}
          <footer className="border-t border-zombie-green/10 mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <p>© 2026 ZombieYield. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Powered by Torque
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>Solana Network</span>
                </div>
              </div>
            </div>
          </footer>

          {/* Dev Debug Panel - only visible in development */}
          <DevDebugPanel />
        </div>
      </WalletContextProvider>
    </ErrorBoundary>
  );
}

export default App;
