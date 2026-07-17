import { Box, Typography } from '@mui/material';

/**
 * The dashboard's page header: who you are and what day it is.
 *
 * Deliberately *not* a gradient hero. A saturated banner with drifting doodles
 * is right for the consumer app's auth flow — a screen you see once, for ten
 * seconds — but on an internal tool it read as loud and unprofessional, and a
 * greeting alone could never fill it. What's left is the greeting itself, with a
 * single accent colour on the name.
 *
 * Pass [action] to hang something on the right.
 */
export default function DashboardHeader({ title, accent, subtitle, action }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 3,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#111827',
            lineHeight: 1.15,
          }}
        >
          {title}
          {accent && (
            <Box component="span" sx={{ color: '#2563EB', ml: 1 }}>
              {accent}
            </Box>
          )}
        </Typography>

        {subtitle && (
          <Typography sx={{ mt: 0.5, fontSize: '0.9rem', color: '#8A93A3' }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {action}
    </Box>
  );
}
