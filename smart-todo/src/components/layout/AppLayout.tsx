import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function AppLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`${isMobile ? 'pb-16' : 'md:ml-60'} min-h-screen`}>
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
      {isMobile && <MobileNav />}
    </div>
  );
}
