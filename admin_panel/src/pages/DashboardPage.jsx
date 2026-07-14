import React from 'react';
import {
  Box, Card, Typography, Avatar, Table, TableBody, TableCell,
  TableHead, TableRow, Button, Grid, Stack, CircularProgress, Chip
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';

import { useDashboardStats, useAdminUsers, useAdminClubs } from '@/hooks/useAdmin';
import { ROUTES } from '@/constants';

/* ---------- Stat Card ---------- */
function StatCard({ title, value, trend, icon: Icon, gradient, iconBg }) {
  const isPositive = trend?.startsWith('+');
  return (
    <Card
      sx={{
        p: 0,
        borderRadius: '18px',
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 32px rgba(0,0,0,0.11)' },
        position: 'relative',
      }}
    >
      {/* Coloured top slice */}
      <Box sx={{ height: 5, background: gradient }} />

      <Box sx={{ p: 2.5 }}>
        {/* Icon + trend row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '14px',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 26, color: '#fff' }} />
          </Box>
          {trend && (
            <Chip
              size="small"
              icon={isPositive ? <ArrowUpwardIcon style={{ fontSize: 13 }} /> : <ArrowDownwardIcon style={{ fontSize: 13 }} />}
              label={trend}
              sx={{
                height: 26, fontSize: '0.8rem', fontWeight: 700,
                bgcolor: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: isPositive ? '#059669' : '#DC2626',
                '& .MuiChip-icon': { color: 'inherit', ml: '4px' },
                border: 'none',
              }}
            />
          )}
        </Box>

        {/* Number */}
        <Typography variant="h3" fontWeight={800} sx={{ color: '#111827', fontSize: '2.8rem', lineHeight: 1, mb: 0.5, mt: 1.5, letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.9rem' }}>
          {title}
        </Typography>
      </Box>

      {/* Decorative circle */}
      <Box sx={{
        position: 'absolute', bottom: -20, right: -20,
        width: 90, height: 90, borderRadius: '50%',
        background: iconBg, opacity: 0.06,
      }} />
    </Card>
  );
}

/* ---------- Table Section Wrapper ---------- */
function TableSection({ title, onViewAll, loading, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#111827', letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500, fontSize: '0.85rem' }}>
            Latest entries from the platform
          </Typography>
        </Box>
        <Button
          onClick={onViewAll}
          size="small"
          endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
          sx={{
            textTransform: 'none', fontWeight: 700, fontSize: '0.8rem',
            color: '#FF5A5F', borderRadius: '8px',
            px: 1.5, py: 0.75,
            '&:hover': { bgcolor: 'rgba(255,90,95,0.08)' },
          }}
        >
          View All
        </Button>
      </Box>
      <Card sx={{
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}>
        {loading ? (
          <Box sx={{ p: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={22} sx={{ color: '#FF5A5F' }} />
            <Typography variant="body2" color="text.secondary">Loading...</Typography>
          </Box>
        ) : children}
      </Card>
    </Box>
  );
}

/* ---------- Role Chip ---------- */
function RoleChip({ role }) {
  const map = {
    admin: { label: 'Admin', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    club_owner: { label: 'Club Owner', color: '#0284C7', bg: 'rgba(2,132,199,0.1)' },
    parent: { label: 'Parent', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  };
  const s = map[role] ?? { label: role, color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
  return (
    <Box sx={{
      display: 'inline-block', px: 2, py: 0.5,
      borderRadius: '20px',
      bgcolor: s.bg, color: s.color,
      fontSize: '0.82rem', fontWeight: 700,
    }}>
      {s.label}
    </Box>
  );
}

/* ---------- Status Chip ---------- */
function StatusChip({ status }) {
  const map = {
    approved: { label: 'Approved', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
    pending: { label: 'Pending', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
    rejected: { label: 'Rejected', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
    suspended: { label: 'Suspended', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  };
  const s = map[status] ?? { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
  return (
    <Box sx={{
      display: 'inline-block', px: 2, py: 0.5,
      borderRadius: '20px',
      bgcolor: s.bg, color: s.color,
      fontSize: '0.82rem', fontWeight: 700,
    }}>
      {s.label}
    </Box>
  );
}

/* ---------- Enhanced Table Head ---------- */
const TH = ({ children, ...props }) => (
  <TableCell
    {...props}
    sx={{
      bgcolor: '#F9FAFB',
      color: '#6B7280',
      fontWeight: 700,
      fontSize: '0.82rem',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      py: 2.25,
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      ...props.sx,
    }}
  >
    {children}
  </TableCell>
);

/* ---------- Main Dashboard Page ---------- */
export function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, isError } = useDashboardStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({ page: 1, limit: 5 });
  const { data: clubsData, isLoading: clubsLoading } = useAdminClubs({ page: 1, limit: 5 });

  const clubsTotal    = stats?.clubs.total   ?? 0;
  const clubsPending  = stats?.clubs.pending ?? 0;
  const usersTotal    = stats?.users.total   ?? 0;
  const eventsTotal   = stats?.events.total  ?? 0;
  const inactiveClubs = (stats?.clubs.rejected ?? 0) + (stats?.clubs.suspended ?? 0) + (stats?.clubs.hidden ?? 0);

  const KPI_CARDS = [
    {
      title: 'Total Users',
      value: statsLoading || isError ? '—' : usersTotal.toLocaleString(),
      icon: GroupsIcon,
      gradient: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
      iconBg: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    },
    {
      title: 'Active Organizations',
      value: statsLoading || isError ? '—' : clubsTotal.toLocaleString(),
      icon: BusinessCenterIcon,
      gradient: 'linear-gradient(90deg, #EC4899, #F97316)',
      iconBg: 'linear-gradient(135deg, #EC4899, #F97316)',
    },
    {
      title: 'Total Events',
      value: statsLoading || isError ? '—' : eventsTotal.toLocaleString(),
      icon: EventAvailableIcon,
      gradient: 'linear-gradient(90deg, #14B8A6, #06B6D4)',
      iconBg: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
    },
    {
      title: 'Pending Club Review',
      value: statsLoading || isError ? '—' : clubsPending.toLocaleString(),
      icon: HourglassTopRoundedIcon,
      gradient: 'linear-gradient(90deg, #F59E0B, #EF4444)',
      iconBg: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    },
    {
      title: 'Inactive Organizations',
      value: statsLoading || isError ? '—' : inactiveClubs.toLocaleString(),
      icon: TrendingUpIcon,
      gradient: 'linear-gradient(90deg, #64748B, #94A3B8)',
      iconBg: 'linear-gradient(135deg, #64748B, #94A3B8)',
    },
  ];

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

      {/* Recently Added Users */}
      <TableSection
        title="Recently Added Users"
        onViewAll={() => navigate(ROUTES.users)}
        loading={usersLoading}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TH sx={{ pl: 3 }}>User</TH>
              <TH>Email</TH>
              <TH>Role</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData?.items?.slice(0, 5).map((user, idx) => (
              <TableRow
                key={user.id}
                hover
                sx={{
                  '&:last-child td': { borderBottom: 'none' },
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: 'rgba(255,90,95,0.025)' },
                }}
              >
                <TableCell sx={{ pl: 3, py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2.5}>
                    <Avatar
                      src={user.avatarUrl}
                      sx={{
                        width: 44, height: 44,
                        background: `linear-gradient(135deg, hsl(${(idx * 47) % 360},70%,55%), hsl(${(idx * 47 + 40) % 360},70%,50%))`,
                        fontSize: '1.05rem', fontWeight: 700,
                      }}
                    >
                      {user.name?.[0]}
                    </Avatar>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#111827' }}>
                      {user.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: '#6B7280', fontSize: '0.95rem' }}>{user.email}</TableCell>
                <TableCell><RoleChip role={user.role} /></TableCell>
              </TableRow>
            ))}
            {!usersData?.items?.length && (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 5, color: '#9CA3AF' }}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSection>

      {/* Recently Added Organizations */}
      <TableSection
        title="Recently Added Organizations"
        onViewAll={() => navigate(ROUTES.clubs)}
        loading={clubsLoading}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TH sx={{ pl: 3 }}>Organization</TH>
              <TH>Email</TH>
              <TH>Address</TH>
              <TH>Status</TH>
              <TH>Action</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {clubsData?.items?.slice(0, 5).map((club, idx) => (
              <TableRow
                key={club.id}
                hover
                sx={{
                  '&:last-child td': { borderBottom: 'none' },
                  '&:hover': { bgcolor: 'rgba(255,90,95,0.025)' },
                }}
              >
                <TableCell sx={{ pl: 3, py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2.5}>
                    <Avatar
                      variant="rounded"
                      src={club.logo}
                      sx={{
                        width: 44, height: 44, borderRadius: '12px',
                        background: `linear-gradient(135deg, hsl(${(idx * 73) % 360},60%,50%), hsl(${(idx * 73 + 40) % 360},60%,45%))`,
                        fontSize: '1.05rem', fontWeight: 700,
                      }}
                    >
                      {club.name?.[0]}
                    </Avatar>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#111827' }}>
                      {club.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: '#6B7280', fontSize: '0.95rem' }}>
                  {club.contact?.email ?? club.owner?.email ?? '—'}
                </TableCell>
                <TableCell sx={{ color: '#9CA3AF', fontSize: '0.92rem', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {club.address || club.city || '—'}
                </TableCell>
                <TableCell><StatusChip status={club.status} /></TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 700, textTransform: 'none', fontSize: '0.75rem',
                      borderRadius: '8px', borderColor: 'rgba(0,0,0,0.12)',
                      color: '#374151', py: 0.5,
                      '&:hover': { borderColor: '#FF5A5F', color: '#FF5A5F', bgcolor: 'rgba(255,90,95,0.05)' },
                    }}
                    onClick={() => navigate(`/clubs/${club.id}/edit`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!clubsData?.items?.length && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: '#9CA3AF' }}>
                  No organizations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSection>

    </Box>
  );
}

export default DashboardPage;
