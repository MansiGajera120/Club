import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants';

/** Fallback page for unknown routes. */
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="h2" fontWeight={800}>
          404
        </Typography>
        <Typography color="text.secondary">Page not found</Typography>
        <Button variant="contained" onClick={() => navigate(ROUTES.dashboard)}>
          Back to dashboard
        </Button>
      </Stack>
    </Box>
  );
}

export default NotFoundPage;
