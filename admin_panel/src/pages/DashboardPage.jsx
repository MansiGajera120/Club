import { Box, Typography, Grid } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { useDashboardStats } from '@/hooks/useAdmin';
import { BreakdownDonutChart, UserGrowthChart } from '@/components/ui';

const GAP = 3;

/* ---------- Stat Card (minimal, reference-style) ---------- */
function StatCard({ title, value, icon: Icon, iconColor, iconBg }) {
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
      {/* Label + Icon row */}
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

      {/* Big number */}
      <Typography
        sx={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: '#262525',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          mt: 'auto',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* ---------- Main Dashboard Page (Overview + Analytics combined) ---------- */
export function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  const clubsTotal    = stats?.clubs.total   ?? 0;
  const clubsPending  = stats?.clubs.pending ?? 0;
  const usersTotal    = stats?.users.total   ?? 0;
  const eventsTotal   = stats?.events.total  ?? 0;
  const inactiveClubs = (stats?.clubs.rejected ?? 0) + (stats?.clubs.suspended ?? 0) + (stats?.clubs.hidden ?? 0);

  const KPI_CARDS = [
    {
      title: 'Total Users',
      value: isLoading || isError ? '—' : usersTotal.toLocaleString(),
      icon: GroupsIcon,
      iconColor: '#16A34A',
      iconBg: '#DCFCE7',
    },
    {
      title: 'Active Organizations',
      value: isLoading || isError ? '—' : clubsTotal.toLocaleString(),
      icon: BusinessCenterIcon,
      iconColor: '#F97316',
      iconBg: '#FFF7ED',
    },
    {
      title: 'Total Events',
      value: isLoading || isError ? '—' : eventsTotal.toLocaleString(),
      icon: EventAvailableIcon,
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
    },
    {
      title: 'Pending Club Review',
      value: isLoading || isError ? '—' : clubsPending.toLocaleString(),
      icon: HourglassTopRoundedIcon,
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
    },
    {
      title: 'Inactive Organizations',
      value: isLoading || isError ? '—' : inactiveClubs.toLocaleString(),
      icon: TrendingUpIcon,
      iconColor: '#7C3AED',
      iconBg: '#F5F3FF',
    },
  ];

  const userChartData = [
    { name: 'Parents', value: stats?.users.parents ?? 0, color: 'info' },
    { name: 'Club Owners', value: stats?.users.clubOwners ?? 0, color: 'secondary' },
    { name: 'Admins', value: stats?.users.admins ?? 0, color: 'primary' },
  ].filter((item) => item.value > 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* KPI Cards */}
      <Grid container spacing={2.5}>
        {KPI_CARDS.map((card) => (
          <Grid key={card.title} item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Platform Insights — independent section heading */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#111827', letterSpacing: '-0.01em' }}>
          Platform Insights
        </Typography>

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
            data={userChartData}
            loading={isLoading}
            emptyMessage="No user data available"
            showLegend
            showBreakdown={false}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardPage;
