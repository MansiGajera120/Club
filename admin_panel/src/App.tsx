import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from '@/theme';
import { queryClient } from '@/services/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import AppRoutes from '@/routes/AppRoutes';

/**
 * Composition root. Wires every cross-cutting provider in the correct order:
 * React Query → MUI Theme → Auth → Router.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
        <ToastContainer position="top-right" autoClose={4000} newestOnTop />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
