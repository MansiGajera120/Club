import { Box, Card, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';

import { useDashboardStats } from '@/hooks/useAdmin';
import { brand } from '@/theme/tokens';
import { BreakdownDonutChart, UserGrowthChart } from '@/components/ui';

const GAP = 3;

function KPICard({ title, value, trend, label, icon: Icon, iconColor, iconBg, isNegative = false }) {
  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #EEEFF2',
        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        p: 3.5,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 140,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography
          sx={{
            fontSize: '0.88rem',
            fontWeight: 500,
            color: '#9CA3AF',
            lineHeight: 1.4,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            ml: 1,
          }}
        >
          <Icon sx={{ fontSize: 22, color: iconColor }} />
        </Box>
      </Box>

      <Typography
        sx={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: '#262525',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          mt: 'auto',
          mb: 1.5,
        }}
      >
        {value}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isNegative ? (
          <ArrowDownwardIcon sx={{ fontSize: 16, color: '#EF4444' }} />
        ) : (
          <ArrowUpwardIcon sx={{ fontSize: 16, color: '#10B981' }} />
        )}
        <Typography variant="caption" sx={{ color: isNegative ? '#EF4444' : '#10B981', fontWeight: 700 }}>
          {trend}
        </Typography>
        <Typography variant="caption" sx={{ color: '#9CA3AF', ml: 0.5 }}>
          {label}
        </Typography>
      </Box>
    </Box>
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
          icon={BusinessCenterIcon}
          iconColor="#0284C7"
          iconBg="rgba(2,132,199,0.06)"
        />
        <KPICard 
          title="Pending Club Review" 
          value={isError ? '—' : clubsPending.toLocaleString()} 
          trend={clubsPending > 0 ? 'Action required' : 'Queue clear'} 
          label="Awaiting moderation" 
          icon={HourglassTopRoundedIcon}
          iconColor={clubsPending > 0 ? '#EA580C' : '#10B981'}
          iconBg={clubsPending > 0 ? 'rgba(234,88,12,0.08)' : 'rgba(16,185,129,0.08)'}
          isNegative={clubsPending > 0}
        />
        <KPICard 
          title="Total Users" 
          value={isError ? '—' : usersTotal.toLocaleString()} 
          trend="Live" 
          label="Across all roles" 
          icon={GroupsIcon}
          iconColor="#7C3AED"
          iconBg="rgba(124,58,237,0.06)"
        />
        <KPICard 
          title="Scheduled Events" 
          value={isError ? '—' : eventsTotal.toLocaleString()} 
          trend="Live" 
          label="Platform-wide" 
          icon={EventAvailableIcon}
          iconColor="#FF5A5F"
          iconBg="rgba(255,90,95,0.06)"
        />
      </Box>

      {/* Second Row: Authentic data breakdowns using the styled layout cards */}
      <Card sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '18px', border: '1px solid #EEEFF2', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', bgcolor: '#FFFFFF', elevation: 0 }}>
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
