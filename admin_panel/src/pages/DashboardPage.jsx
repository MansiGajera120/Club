import { Box, Button, Stack, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import EventIcon from '@mui/icons-material/Event';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { useNavigate } from 'react-router-dom';

import { CompactMetric, ContentCard, StatCard } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useAdmin';

const GAP = 2.5;

/**
 * Dashboard — fits on one screen (desktop) with spaced sections and no scroll.
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

  const clubStatuses = [
    { label: 'Approved', value: value(stats?.clubs.approved), icon: CheckCircleIcon, color: 'success' },
    { label: 'Pending', value: value(stats?.clubs.pending), icon: HourglassTopIcon, color: 'warning' },
    { label: 'Rejected', value: value(stats?.clubs.rejected), icon: BlockIcon, color: 'error' },
    { label: 'Featured', value: value(stats?.clubs.featured), icon: StarIcon, color: 'info' },
    { label: 'Suspended', value: value(stats?.clubs.suspended), icon: BlockIcon, color: 'warning' },
    { label: 'Hidden', value: value(stats?.clubs.hidden), icon: VisibilityOffIcon, color: 'secondary' },
  ];

  const userMetrics = [
    { label: 'Owners', value: value(stats?.users.clubOwners), icon: StorefrontIcon, color: 'secondary' },
    { label: 'Parents', value: value(stats?.users.parents), icon: FamilyRestroomIcon, color: 'info' },
    { label: 'Admins', value: value(stats?.users.admins), icon: PeopleIcon, color: 'primary' },
    { label: 'Disabled', value: value(stats?.users.disabled), icon: PersonOffIcon, color: 'error' },
  ];

  const quickLinks = [
    { label: 'Review pending', icon: HourglassTopIcon, onClick: () => navigate(`${ROUTES.clubs}?status=pending`) },
    { label: 'Manage users', icon: PeopleIcon, onClick: () => navigate(ROUTES.users) },
    { label: 'Browse events', icon: EventIcon, onClick: () => navigate(ROUTES.events) },
  ];

  return (
    <Box
      sx={{
        height: { xs: 'auto', lg: 'calc(100dvh - 112px)' },
        maxHeight: { lg: 'calc(100dvh - 112px)' },
        display: 'flex',
        flexDirection: 'column',
        gap: GAP,
        overflow: { xs: 'visible', lg: 'hidden' },
        pb: { xs: 4, lg: 0 },
      }}
    >
      {/* Welcome */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ flexShrink: 0 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} lineHeight={1.25}>
            Welcome back, {greetingName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Platform overview for today.
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
          {today}
        </Typography>
      </Stack>

      {/* KPI row */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: GAP,
          minHeight: { lg: 118 },
        }}
      >
        <StatCard compact label="Total clubs" value={value(clubsTotal)} icon={GroupsIcon} color="primary" loading={isLoading} helper={`${value(clubsApproved)} approved`} />
        <StatCard compact label="Pending" value={value(clubsPending)} icon={HourglassTopIcon} color="warning" loading={isLoading} helper={clubsPending > 0 ? 'Needs review' : 'Clear'} />
        <StatCard compact label="Users" value={value(usersTotal)} icon={PeopleIcon} color="info" loading={isLoading} helper={`${value(stats?.users.parents)} parents`} />
        <StatCard compact label="Events" value={value(eventsTotal)} icon={EventIcon} color="secondary" loading={isLoading} helper="Scheduled" />
      </Box>

      {/* Quick actions */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={GAP} sx={{ flexShrink: 0 }}>
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.label}
              variant="outlined"
              onClick={link.onClick}
              startIcon={<Icon />}
              sx={{
                flex: 1,
                py: 1.5,
                px: 2,
                minHeight: 48,
                borderRadius: 2.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
              }}
            >
              {link.label}
            </Button>
          );
        })}
      </Stack>

      {/* Breakdown — aligned Clubs | Users columns */}
      <ContentCard
        sx={{
          flex: 1,
          minHeight: 0,
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, flexShrink: 0 }}>
          Platform breakdown
        </Typography>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Section labels — same row, aligned */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: GAP,
              flexShrink: 0,
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={700}
              sx={{ letterSpacing: '0.08em' }}
            >
              Clubs
            </Typography>
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={700}
              sx={{ letterSpacing: '0.08em', display: { xs: 'none', lg: 'block' } }}
            >
              Users
            </Typography>
          </Box>

          {/* Metric grids — equal columns, same row heights */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: GAP,
              position: 'relative',
            }}
          >
            {/* Vertical divider between columns (desktop) */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'block' },
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: '1px',
                bgcolor: 'divider',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
              }}
            />

            {/* Clubs */}
            <Box
              sx={{
                minHeight: 0,
                height: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                gap: GAP,
              }}
            >
              {clubStatuses.map((item) => (
                <CompactMetric key={item.label} stacked {...item} loading={isLoading} />
              ))}
            </Box>

            {/* Users */}
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={700}
                sx={{
                  letterSpacing: '0.08em',
                  mb: 1.5,
                  display: { xs: 'block', lg: 'none' },
                  flexShrink: 0,
                }}
              >
                Users
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                  gap: GAP,
                  height: '100%',
                }}
              >
                {userMetrics.map((item) => (
                  <CompactMetric key={item.label} stacked {...item} loading={isLoading} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </ContentCard>

      {isError && (
        <Typography variant="caption" color="error.main" sx={{ flexShrink: 0 }}>
          Could not load statistics. Refresh to try again.
        </Typography>
      )}
    </Box>
  );
}

export default DashboardPage;
