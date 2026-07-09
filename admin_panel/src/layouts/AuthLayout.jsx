import { Outlet } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';

/**
 * Centered shell for unauthenticated pages (login, and later forgot/reset
 * password). Keeps auth screens visually distinct from the dashboard.
 */
export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper sx={{ p: 4 }} elevation={0}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthLayout;
