import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import FullPageLoader from '@/components/common/FullPageLoader';

/**
 * Guards admin routes. While the session is being restored it shows a loader;
 * unauthenticated users are redirected to the login page.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
