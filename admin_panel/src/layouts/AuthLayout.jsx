import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { gradients } from '@/theme/tokens';
import DoodleField from '@/components/ui/DoodleField';

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
      {/* Left: the brand panel — a saturated gradient scattered with the app's
          own hand-drawn marks, mirroring the mobile splash so both products
          introduce themselves with the same face.

          This is the one surface in the tool that gets to be loud: it's seen
          once, for a few seconds, and has no data to compete with — unlike the
          dashboard, which is read every day and stays deliberately calm. */}
      {isDesktop && (
        <Box
          sx={{
            flex: { md: 1, lg: 1.2 },
            background: gradients.brand,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // The marks are sized to bleed past the panel; this is what keeps
            // them inside it.
            overflow: 'hidden',
            borderBottomRightRadius: { md: '64px', lg: '80px' },
            borderTopRightRadius: { md: '64px', lg: '80px' },
            boxShadow: '12px 0 32px rgba(0,0,0,0.06)',
            zIndex: 1,
          }}
        >
          <DoodleField />

          {/* The illustration, framed. It's a JPG with its own near-white
              background, so laid straight onto the gradient it would read as a
              white rectangle — the card makes that edge deliberate, and matches
              the white form card the mobile app floats over the same gradient.
              Sized well below the panel so the marks still have room to drift
              around it. */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              p: 1.5,
              bgcolor: '#FFFFFF',
              borderRadius: '28px',
              boxShadow: '0 18px 44px rgba(15,23,42,0.22)',
              width: { md: '80%', lg: '74%' },
              maxWidth: 480,
            }}
          >
            <Box
              component="img"
              src="/login-illustration.jpg"
              alt="An administrator reviewing club activity on a laptop"
              sx={{
                display: 'block',
                width: '100%',
                height: 'auto',
                borderRadius: '20px',
              }}
            />
          </Box>
        </Box>
      )}

      {/* Right: the form shell. Stays plain white — nothing should compete with
          the fields someone is trying to fill in. */}
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
