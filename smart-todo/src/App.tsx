import { useEffect } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import Providers from '@/app/providers';
import { routes } from '@/app/routes';
import { seedMockTasks } from '@/features/task/seed';
import { useAuthStore } from '@/features/auth/store';

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
    seedMockTasks();
  }, []);

  return (
    <Providers>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Providers>
  );
}

export default App;
