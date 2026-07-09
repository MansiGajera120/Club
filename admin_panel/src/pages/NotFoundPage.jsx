import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

import { ROUTES } from '@/constants';

/** 404 page for unmatched routes. */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h2" fontWeight={800} color="primary">
        404
      </Typography>
      <Typography color="text.secondary">
        The page you are looking for does not exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate(ROUTES.dashboard)}>
        Back to Dashboard
      </Button>
    </Box>
  );
}

export default NotFoundPage;
