import React, { useState } from 'react';
import { Box, Card, Typography, Select, MenuItem, Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


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

export function UserGrowthChart({ data = [] }) {
  const [timeframe, setTimeframe] = useState('This Week');

  const chartData = data?.length > 0 ? data : [
    { name: 'Sun', Parents: 0, ClubOwners: 0, Admins: 0 },
    { name: 'Mon', Parents: 0, ClubOwners: 0, Admins: 0 },
    { name: 'Tue', Parents: 0, ClubOwners: 0, Admins: 0 },
    { name: 'Wed', Parents: 0, ClubOwners: 0, Admins: 0 },
    { name: 'Thu', Parents: 0, ClubOwners: 0, Admins: 0 },
    { name: 'Fri', Parents: 0, ClubOwners: 0, Admins: 0 },
    { name: 'Sat', Parents: 0, ClubOwners: 0, Admins: 0 },
  ];

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#111827' }}>
          User Growth Trends
        </Typography>
        <Select
          size="small"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          sx={{ 
            borderRadius: 2, 
            height: 32, 
            typography: 'caption', 
            fontWeight: 600,
            '.MuiSelect-select': { py: 0.5, px: 2 }
          }}
        >
          <MenuItem value="This Week" sx={{ typography: 'caption', fontWeight: 500 }}>This Week</MenuItem>
          <MenuItem value="Last Week" sx={{ typography: 'caption', fontWeight: 500 }}>Last Week</MenuItem>
          <MenuItem value="This Month" sx={{ typography: 'caption', fontWeight: 500 }}>This Month</MenuItem>
        </Select>
      </Box>

      <Box sx={{ flex: 1, minHeight: 250, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6B7280' }} 
              dy={15} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6B7280' }} 
              allowDecimals={false}
              domain={[0, (dataMax) => Math.max(dataMax, 2)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="Parents" 
              stroke="#4bc39a" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#4bc39a', strokeWidth: 0 }} 
              activeDot={{ r: 7 }} 
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="ClubOwners" 
              stroke="#8faea3" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#8faea3', strokeWidth: 0 }} 
              activeDot={{ r: 7 }} 
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="Admins" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }} 
              activeDot={{ r: 7 }} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 4, mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4bc39a' }} />
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Parents</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#8faea3' }} />
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Club Owners</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Admins</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export default UserGrowthChart;
