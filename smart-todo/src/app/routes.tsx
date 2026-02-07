import type { RouteObject } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ChatView from '@/components/chat/ChatView';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Calendar from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import Inbox from '@/pages/Inbox';
import Settings from '@/pages/Settings';

export const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ChatView /> },
      { path: 'tasks', element: <Home /> },
      { path: 'inbox', element: <Inbox /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
];
