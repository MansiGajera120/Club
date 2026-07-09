import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ColorModeProvider } from '@/context/ColorModeContext';
import { queryClient } from '@/services/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import AppRoutes from '@/routes/AppRoutes';

/**
 * Application root. Composes global providers (theme + color mode,
 * data-fetching, auth, routing) in one place so feature code stays focused.
 */
export function App() {
  return (
    <ColorModeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    </ColorModeProvider>
  );
}

export default App;
