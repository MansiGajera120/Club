import { Routes, Route, Navigate } from 'react-router-dom';

import { ROUTES } from '@/constants';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ClubsPage from '@/pages/ClubsPage';
import UsersPage from '@/pages/UsersPage';
import EventsPage from '@/pages/EventsPage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Application route table. Public auth routes sit under [AuthLayout]; everything
 * else is guarded by [ProtectedRoute] and rendered inside [DashboardLayout].
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.clubs} element={<ClubsPage />} />
          <Route path={ROUTES.users} element={<UsersPage />} />
          <Route path={ROUTES.events} element={<EventsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AppRoutes;
