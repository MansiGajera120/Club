import { Box, Skeleton, Typography } from '@mui/material';

import { brand } from '@/theme/tokens';

const COLOR_MAP = {
  primary: { main: brand.primary, soft: 'rgba(255,90,95,0.12)' },
  secondary: { main: brand.secondary, soft: 'rgba(255,142,107,0.14)' },
  success: { main: '#22C55E', soft: 'rgba(34,197,94,0.12)' },
  warning: { main: '#F59E0B', soft: 'rgba(245,158,11,0.14)' },
  info: { main: '#3B82F6', soft: 'rgba(59,130,246,0.12)' },
  error: { main: '#EF4444', soft: 'rgba(239,68,68,0.12)' },
};

/**
 * Metric tile for dashboard breakdown grids. Stretches to fill grid cell height.
 */
export function CompactMetric({
  label,
  value,
  icon: Icon,
  color = 'primary',
  loading = false,
  stacked = false,
}) {
  const palette = COLOR_MAP[color] ?? COLOR_MAP.primary;

  if (stacked) {
    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 72,
          p: 2,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1.25,
        }}
      >
        {Icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: palette.soft,
              color: palette.main,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
        )}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block' }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={36} height={32} sx={{ mt: 0.5 }} />
          ) : (
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.35, lineHeight: 1.1 }}>
              {value}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        minHeight: 64,
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: palette.soft,
            color: palette.main,
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          noWrap
          sx={{ letterSpacing: '0.03em', textTransform: 'uppercase', display: 'block' }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={28} height={28} sx={{ mt: 0.25 }} />
        ) : (
          <Typography variant="h6" fontWeight={800} sx={{ mt: 0.15, lineHeight: 1.1 }}>
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default CompactMetric;
