import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import FullPageLoader from '@/components/common/FullPageLoader';

/**
 * Guards admin routes. While the session is being restored it shows a loader;
 * unauthenticated users — and any authenticated non-admin — are redirected to
 * the login page. The admin-only rule is asserted here (defence in depth) in
 * addition to the AuthContext filtering, so the route itself is the source of
 * truth for access.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
