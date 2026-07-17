import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export function AuthLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Left Side: Full-height Illustration Section */}
      {isDesktop && (
        <Box
          sx={{
            flex: { md: 1, lg: 1.2 }, // Takes up more space on very large screens
            bgcolor: '#EEF3FB', // Light premium background
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderBottomRightRadius: { md: '64px', lg: '80px' },
            borderTopRightRadius: { md: '64px', lg: '80px' },
            boxShadow: '12px 0 32px rgba(0,0,0,0.03)',
            zIndex: 1,
          }}
        >
          {/* Subtle background decorative shapes */}
          <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(56,189,248,0) 70%)' }} />
          <Box sx={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, rgba(37,99,235,0) 70%)' }} />
          
          <Box
            component="img"
            src="/login-illustration.jpg"
            alt="Admin login illustration"
            sx={{
              width: '100%',
              height: '100%',
              maxWidth: '85%',
              maxHeight: '85%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.06))',
            }}
          />
        </Box>
      )}

      {/* Right Side: Page Shell containing Outlet */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6, md: 8 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '520px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AuthLayout;
