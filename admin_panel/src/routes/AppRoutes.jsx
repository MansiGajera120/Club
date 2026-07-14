import { Routes, Route, Navigate } from 'react-router-dom';

import { ROUTES } from '@/constants';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ClubsPage from '@/pages/ClubsPage';
import ClubFormPage from '@/pages/ClubFormPage';
import UsersPage from '@/pages/UsersPage';
import EventsPage from '@/pages/EventsPage';
import EventFormPage from '@/pages/EventFormPage';
import SettingsPage from '@/pages/SettingsPage';
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
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
          <Route path={ROUTES.clubs} element={<ClubsPage />} />
          <Route path={ROUTES.clubNew} element={<ClubFormPage />} />
          <Route path={ROUTES.clubEdit} element={<ClubFormPage />} />
          <Route path={ROUTES.users} element={<UsersPage />} />
          <Route path={ROUTES.events} element={<EventsPage />} />
          <Route path={ROUTES.eventNew} element={<EventFormPage />} />
          <Route path={ROUTES.eventEdit} element={<EventFormPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AppRoutes;
