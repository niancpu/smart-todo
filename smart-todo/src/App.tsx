import { useEffect, useState } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import Providers from '@/app/providers';
import { routes } from '@/app/routes';
import { seedMockTasks } from '@/features/task/seed';
import { useAuthStore } from '@/features/auth/store';

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1400);
    const remove = setTimeout(onDone, 1900);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, [onDone]);

  return (
    <div className={`splash-screen ${fadeOut ? 'splash-out' : ''}`}>
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1 animate-blob" />
        <div className="blob blob-2 animate-blob-reverse" />
      </div>

      {/* Logo */}
      <div className="splash-logo flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-2xl glass-heavy flex items-center justify-center shadow-glow">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="9" y="3" width="6" height="4" rx="1.5" stroke="#3b82f6" strokeWidth="1.8" />
            <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="splash-text text-center">
          <h1 className="font-display text-2xl font-semibold text-slate-800 tracking-tight">Smart Todo</h1>
          <p className="text-sm text-slate-500 mt-1 font-body">智能待办，从容生活</p>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initialize();
    seedMockTasks();
  }, []);

  return (
    <Providers>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Providers>
  );
}

export default App;
