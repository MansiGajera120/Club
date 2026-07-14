import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { brand, neutralLight, status } from '@/theme/tokens';

const CHART_COLORS = {
  success: status.success,
  warning: status.warning,
  danger: status.danger,
  info: status.info,
  primary: brand.primary,
  secondary: brand.secondary,
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 2,
      }}
    >
      <Typography variant="caption" fontWeight={700} display="block">
        {item.name}
      </Typography>
      <Typography variant="body2" fontWeight={800} color="text.primary">
        {item.value}
      </Typography>
    </Box>
  );
}

/**
 * Compact donut chart for platform breakdown sections.
 */
export function BreakdownDonutChart({
  title,
  subtitle,
  data = [],
  loading = false,
  emptyMessage = 'No data yet',
}) {
  const total = data.reduce((sum, item) => sum + (item.value ?? 0), 0);
  const hasData = total > 0;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 12px rgba(42, 42, 53, 0.04)',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={800}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {loading ? (
        <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto', my: 2 }} />
      ) : !hasData ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 200,
            display: 'grid',
            placeItems: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">{emptyMessage}</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ width: '100%', height: 220, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[entry.color] ?? brand.primary}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {data.map((item) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const fill = CHART_COLORS[item.color] ?? brand.primary;
              return (
                <Stack
                  key={item.name}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: fill,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {item.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="baseline" spacing={1} sx={{ flexShrink: 0 }}>
                    <Typography variant="body2" fontWeight={800}>
                      {item.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pct}%
                    </Typography>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </>
      )}


    </Box>
  );
}

export default BreakdownDonutChart;
