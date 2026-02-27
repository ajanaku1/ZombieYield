import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './views/Dashboard';
import { VideoPage } from './views/VideoPage';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WalletContextProvider } from './components/WalletContextProvider';
import { DevDebugPanel } from './components/DevDebugPanel';

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return hash;
}

function App() {
  const hash = useHashRoute();
  const isVideoPage = hash === '#/video';

  return (
    <ErrorBoundary>
      <WalletContextProvider>
        <div className="min-h-screen bg-zombie-black">
          <ToastContainer />
          <Header />
          <main>
            {isVideoPage ? <VideoPage /> : <Dashboard />}
          </main>

          {/* Footer */}
          <footer className="border-t border-zombie-green/10 mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <p>&copy; 2026 ZombieYield. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <a
                    href="#/video"
                    className="hover:text-zombie-green transition-colors"
                  >
                    Presentation Video
                  </a>
                  <span className="hidden sm:inline">&bull;</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Powered by Torque
                  </span>
                  <span className="hidden sm:inline">&bull;</span>
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
