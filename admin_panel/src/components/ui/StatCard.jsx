import { Avatar, Box, Card, CardContent, LinearProgress, Skeleton, Typography } from '@mui/material';

import { brand, gradients } from '@/theme/tokens';

const COLOR_MAP = {
  primary: { main: brand.primary, soft: 'rgba(255,90,95,0.12)' },
  secondary: { main: brand.secondary, soft: 'rgba(255,142,107,0.14)' },
  success: { main: '#22C55E', soft: 'rgba(34,197,94,0.12)' },
  warning: { main: '#F59E0B', soft: 'rgba(245,158,11,0.14)' },
  info: { main: '#3B82F6', soft: 'rgba(59,130,246,0.12)' },
  error: { main: '#EF4444', soft: 'rgba(239,68,68,0.12)' },
};

/**
 * Dashboard metric tile with optional progress bar for ratio-style stats.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'primary',
  loading = false,
  helper,
  progress,
  compact = false,
}) {
  const palette = COLOR_MAP[color] ?? COLOR_MAP.primary;
  const padding = compact ? 2.75 : 3.5;
  const iconSize = compact ? 50 : 56;

  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: compact ? 2.5 : 3,
        background: '#fff',
        boxShadow: '0 2px 12px rgba(42, 42, 53, 0.04)',
      }}
    >
      <CardContent sx={{ p: padding, '&:last-child': { pb: padding } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: compact ? 2 : 3,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block' }}
            >
              {label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={64} height={compact ? 36 : 48} sx={{ mt: 0.5 }} />
            ) : (
              <Typography
                variant={compact ? 'h4' : 'h4'}
                fontWeight={800}
                sx={{ mt: compact ? 0.75 : 0.75, lineHeight: 1.1 }}
              >
                {value}
              </Typography>
            )}
            {helper && (
              <Typography
                variant={compact ? 'body2' : 'body2'}
                color="text.secondary"
                sx={{ mt: compact ? 0.75 : 1.25, lineHeight: 1.45, display: 'block' }}
              >
                {helper}
              </Typography>
            )}
            {typeof progress === 'number' && !loading && (
              <Box sx={{ mt: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, progress))}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    bgcolor: palette.soft,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      background: gradients.brand,
                    },
                  }}
                />
              </Box>
            )}
          </Box>
          {Icon && (
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: palette.soft,
                color: palette.main,
                width: iconSize,
                height: iconSize,
                borderRadius: 2,
                flexShrink: 0,
                '& svg': { fontSize: compact ? 24 : 26 },
              }}
            >
              <Icon />
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;
