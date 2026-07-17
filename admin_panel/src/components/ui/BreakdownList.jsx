import { Box, Divider, Skeleton, Stack, Typography } from '@mui/material';

import { brand, status } from '@/theme/tokens';

const COLOR_MAP = {
  primary: brand.primary,
  secondary: brand.secondary,
  success: status.success,
  warning: status.warning,
  info: status.info,
  error: status.danger,
};

/**
 * Spacious label / value rows for dashboard breakdown panels.
 */
export function BreakdownList({ items, loading = false }) {
  return (
    <Stack divider={<Divider flexItem />} spacing={0} sx={{ width: '100%' }}>
      {items.map((item) => {
        const Icon = item.icon;
        const tint = COLOR_MAP[item.color] ?? COLOR_MAP.primary;

        return (
          <Box
            key={item.label}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              py: 2.75,
              px: 0.5,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2.5}
              sx={{ minWidth: 0, flex: 1 }}
            >
              {Icon && (
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: `${tint}18`,
                    color: tint,
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </Box>
              )}
              <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.4 }}>
                {item.label}
              </Typography>
            </Stack>
            {loading ? (
              <Skeleton variant="text" width={40} height={36} />
            ) : (
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ flexShrink: 0, minWidth: 48, textAlign: 'right', lineHeight: 1 }}
              >
                {item.value}
              </Typography>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

export default BreakdownList;
