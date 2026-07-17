import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, Stack, Fade, LinearProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useUserGrowth } from '@/hooks/useAdmin';

const RANGES = [
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' },
];

/** '2026-07-12' -> 'Jul 12'. Parsed as UTC, which is how the server bucketed it. */
function formatDay(key) {
  if (!key) return '';
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}


function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="caption" sx={{ color: entry.color, display: 'block', fontWeight: 600 }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
}

export function UserGrowthChart() {
  const [range, setRange] = useState('this-week');
  const { data: growth, isFetching, isError } = useUserGrowth(range);

  const chartData = growth?.points ?? [];
  const rangeLabel = growth ? `${formatDay(growth.start)} – ${formatDay(growth.end)}` : '';

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
        boxShadow: '0 2px 12px rgba(15,23,42, 0.04)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#111827' }}>
            User Growth Trends
          </Typography>
          {/* The dates the filter actually resolved to. Two calendar weeks carry
              identical weekday labels, so without this the only proof that
              "Last Week" did anything is the data itself changing — which it
              won't on a quiet week. */}
          <Typography variant="caption" sx={{ color: '#8A93A3', fontWeight: 600 }}>
            {rangeLabel || ' '}
          </Typography>
        </Box>
        <Select
          size="small"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          sx={{
            borderRadius: 2,
            height: 32,
            typography: 'caption',
            fontWeight: 600,
            '.MuiSelect-select': { py: 0.5, px: 2 }
          }}
        >
          {RANGES.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ typography: 'caption', fontWeight: 500 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* A thin bar rather than swapping the chart for a spinner: the previous
          series stays put (keepPreviousData) and simply refreshes underneath. */}
      <Fade in={isFetching} unmountOnExit>
        <LinearProgress sx={{ height: 2, borderRadius: 1, mb: '-2px' }} />
      </Fade>

      {isError ? (
        <Box sx={{ flex: 1, minHeight: 250, display: 'grid', placeItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#8A93A3' }}>
            Could not load growth data.
          </Typography>
        </Box>
      ) : (
      <Box sx={{ flex: 1, minHeight: 250, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E4EAF2" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#566072' }} 
              dy={15} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#566072' }} 
              allowDecimals={false}
              domain={[0, (dataMax) => Math.max(dataMax, 2)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="Parents" 
              stroke="#2563EB" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#2563EB', strokeWidth: 0 }} 
              activeDot={{ r: 7 }}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="ClubOwners" 
              stroke="#38BDF8" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#38BDF8', strokeWidth: 0 }} 
              activeDot={{ r: 7 }}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Admins"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
              activeDot={{ r: 7 }}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      )}

      <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 4, mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2563EB' }} />
          <Typography variant="caption" sx={{ color: '#566072', fontWeight: 600 }}>Parents</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#38BDF8' }} />
          <Typography variant="caption" sx={{ color: '#566072', fontWeight: 600 }}>Club Owners</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
          <Typography variant="caption" sx={{ color: '#566072', fontWeight: 600 }}>Admins</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export default UserGrowthChart;
