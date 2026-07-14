import { Box, Card, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useDashboardStats } from '@/hooks/useAdmin';
import { brand } from '@/theme/tokens';
import { BreakdownDonutChart, UserGrowthChart } from '@/components/ui';

const GAP = 3;

function KPICard({ title, value, trend, label, color, isNegative = false }) {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', height: '100%', elevation: 0 }}>
      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', mb: 2, flex: 1 }}>
        {value}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isNegative ? (
          <ArrowDownwardIcon sx={{ fontSize: 16, color: '#EF4444' }} />
        ) : (
          <ArrowUpwardIcon sx={{ fontSize: 16, color: color ?? '#10B981' }} />
        )}
        <Typography variant="caption" sx={{ color: isNegative ? '#EF4444' : (color ?? '#10B981'), fontWeight: 700 }}>
          {trend}
        </Typography>
        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
          {label}
        </Typography>
      </Box>
    </Card>
  );
}

/**
 * Admin analytics — Heavily refactored into clean analytic KPI layouts, using genuine data.
 */
export function AnalyticsPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  // Safely extract genuine values
  const clubsTotal = stats?.clubs.total ?? 0;
  const clubsPending = stats?.clubs.pending ?? 0;
  const usersTotal = stats?.users.total ?? 0;
  const eventsTotal = stats?.events.total ?? 0;

  const clubChartData = [
    { name: 'Approved', value: stats?.clubs.approved ?? 0, color: 'success' },
    { name: 'Pending', value: stats?.clubs.pending ?? 0, color: 'warning' },
    { name: 'Rejected', value: stats?.clubs.rejected ?? 0, color: 'danger' },
  ].filter((item) => item.value > 0);

  const userChartData = [
    { name: 'Parents', value: stats?.users.parents ?? 0, color: 'info' },
    { name: 'Club owners', value: stats?.users.clubOwners ?? 0, color: 'secondary' },
    { name: 'Admins', value: stats?.users.admins ?? 0, color: 'primary' },
  ].filter((item) => item.value > 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: GAP, minHeight: '100%', pt: 1 }}>
      
      {/* Top Row: True KPI Clusters mapped cleanly */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
          gap: 2.5 
        }}
      >
        <KPICard 
          title="Total Clubs" 
          value={isError ? '—' : clubsTotal.toLocaleString()} 
          trend="Live" 
          label="Registered on platform" 
          color={brand.primary} 
        />
        <KPICard 
          title="Pending Club Review" 
          value={isError ? '—' : clubsPending.toLocaleString()} 
          trend={clubsPending > 0 ? 'Action required' : 'Queue clear'} 
          label="Awaiting moderation" 
          color={clubsPending > 0 ? '#F59E0B' : '#10B981'} 
        />
        <KPICard 
          title="Total Users" 
          value={isError ? '—' : usersTotal.toLocaleString()} 
          trend="Live" 
          label="Across all roles" 
          color={brand.primary} 
        />
        <KPICard 
          title="Scheduled Events" 
          value={isError ? '—' : eventsTotal.toLocaleString()} 
          trend="Live" 
          label="Platform-wide" 
          color={brand.primary}
        />
      </Box>

      {/* Second Row: Authentic data breakdowns using the styled layout cards */}
      <Card sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, boxShadow: '0 2px 14px rgba(0,0,0,0.03)', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#111827' }}>
            Platform Insights
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: GAP,
          }}
        >
          <UserGrowthChart data={stats?.growth ?? []} />
          <BreakdownDonutChart
            title="User Roles"
            subtitle="Parents, club owners, and admins"
            data={userChartData}
            loading={isLoading}
            emptyMessage="No user data available"
          />
        </Box>
      </Card>

    </Box>
  );
}

export default AnalyticsPage;
