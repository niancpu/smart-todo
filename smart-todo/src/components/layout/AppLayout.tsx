import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function AppLayout() {
  const isMobile = useIsMobile();
  const isBoard = useLocation().pathname === '/board';

  return (
    <div className="min-h-screen font-body relative">
      {/* Animated gradient background */}
      <div className="app-bg" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <div className="blob blob-1 animate-blob" />
        <div className="blob blob-2 animate-blob-reverse" />
        <div className="blob blob-3 animate-blob-slow" />
      </div>

      <Sidebar />
      <main className={`${isMobile ? 'pb-20' : 'md:ml-64'} min-h-screen`}>
        <div className={isBoard ? 'p-4 md:p-6' : 'max-w-3xl mx-auto p-4 md:p-6'}>
          <Outlet />
        </div>
      </main>
      {isMobile && <MobileNav />}
    </div>
  );
}
