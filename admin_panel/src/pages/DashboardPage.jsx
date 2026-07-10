import { Box, Chip, Stack, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';

import {
  BreakdownDonutChart,
  ContentCard,
  QuickActionCard,
  StatCard,
} from '@/components/ui';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useAdmin';
import { brand, gradients, neutralLight } from '@/theme/tokens';

const GAP = 2.5;

/**
 * Admin dashboard — KPI overview, quick actions, and chart-based breakdowns.
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();

  const clubsTotal = stats?.clubs.total ?? 0;
  const clubsApproved = stats?.clubs.approved ?? 0;
  const clubsPending = stats?.clubs.pending ?? 0;
  const usersTotal = stats?.users.total ?? 0;
  const eventsTotal = stats?.events.total ?? 0;

  const greetingName = user?.name?.split(' ')[0] ?? 'Admin';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const value = (n) => (isError ? '—' : (n ?? 0));

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

  const quickLinks = [
    {
      title: 'Review pending clubs',
      description: clubsPending > 0 ? `${clubsPending} awaiting approval` : 'No clubs in queue',
      icon: HourglassTopIcon,
      onClick: () => navigate(`${ROUTES.clubs}?status=pending`),
      accent: brand.primary,
    },
    {
      title: 'Manage users',
      description: `${value(usersTotal)} registered accounts`,
      icon: PeopleIcon,
      onClick: () => navigate(ROUTES.users),
      accent: '#3B82F6',
    },
    {
      title: 'Browse events',
      description: `${value(eventsTotal)} scheduled events`,
      icon: EventIcon,
      onClick: () => navigate(ROUTES.events),
      accent: brand.secondary,
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: GAP,
        pb: { xs: 4, lg: 2 },
      }}
    >
      {/* Hero welcome */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          p: { xs: 2.5, md: 3 },
          background: gradients.brand,
          color: '#fff',
          boxShadow: '0 8px 28px rgba(255, 90, 95, 0.28)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -20,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: '35%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ letterSpacing: '0.12em', fontWeight: 700, opacity: 0.9 }}
            >
              Admin workspace
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.2 }}>
              Welcome back, {greetingName}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.92, maxWidth: 420 }}>
              Monitor clubs, users, and events across the platform.
            </Typography>
          </Box>

          <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Chip
              label={today}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                color: '#fff',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.28)',
              }}
            />
            {clubsPending > 0 && (
              <Chip
                icon={<HourglassTopIcon sx={{ color: '#fff !important' }} />}
                label={`${clubsPending} club${clubsPending === 1 ? '' : 's'} need review`}
                size="small"
                onClick={() => navigate(`${ROUTES.clubs}?status=pending`)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  color: brand.primaryDark,
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#fff' },
                }}
              />
            )}
          </Stack>
        </Stack>
      </Box>

      {/* KPI row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: GAP,
        }}
      >
        <StatCard
          compact
          label="Total clubs"
          value={value(clubsTotal)}
          icon={GroupsIcon}
          color="primary"
          loading={isLoading}
          helper={`${value(clubsApproved)} approved`}
        />
        <StatCard
          compact
          label="Pending review"
          value={value(clubsPending)}
          icon={HourglassTopIcon}
          color="warning"
          loading={isLoading}
          helper={clubsPending > 0 ? 'Action required' : 'Queue clear'}
          progress={clubsTotal > 0 ? (clubsPending / clubsTotal) * 100 : 0}
        />
        <StatCard
          compact
          label="Total users"
          value={value(usersTotal)}
          icon={PeopleIcon}
          color="info"
          loading={isLoading}
          helper={`${value(stats?.users.parents)} parents`}
        />
        <StatCard
          compact
          label="Events"
          value={value(eventsTotal)}
          icon={EventIcon}
          color="secondary"
          loading={isLoading}
          helper="Across all clubs"
        />
      </Box>

      {/* Quick actions */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <TrendingUpIcon sx={{ fontSize: 20, color: brand.primary }} />
          <Typography variant="subtitle1" fontWeight={800}>
            Quick actions
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: GAP,
          }}
        >
          {quickLinks.map((link) => (
            <QuickActionCard key={link.title} {...link} />
          ))}
        </Box>
      </Box>

      {/* Chart breakdowns */}
      <ContentCard sx={{ p: 2.5, bgcolor: neutralLight.surfaceMuted }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              Platform insights
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Key moderation and audience metrics at a glance
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: GAP,
          }}
        >
          <BreakdownDonutChart
            title="Club moderation"
            subtitle="Approved, pending, and rejected"
            data={clubChartData}
            loading={isLoading}
            emptyMessage="No club data available"
          />
          <BreakdownDonutChart
            title="User roles"
            subtitle="Parents, club owners, and admins"
            data={userChartData}
            loading={isLoading}
            emptyMessage="No user data available"
          />
        </Box>
      </ContentCard>

      {isError && (
        <Typography variant="caption" color="error.main">
          Could not load statistics. Refresh to try again.
        </Typography>
      )}
    </Box>
  );
}

export default DashboardPage;
