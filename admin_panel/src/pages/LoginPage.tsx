import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import { env } from '@/config/env';

/**
 * Placeholder login page. The real email/password + validation form and the
 * login mutation are implemented in Phase 6.
 */
export function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={1} mb={3}>
            <Typography variant="h5" fontWeight={800}>
              {env.appName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage clubs, users and events.
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            The login form is implemented in Phase 6.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;
