import { Box, CircularProgress } from '@mui/material';

/** Centered spinner used while a route or the session is initializing. */
export function FullPageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default FullPageLoader;
