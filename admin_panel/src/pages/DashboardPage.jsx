import React from 'react';
import {
  Box, Card, Typography, Avatar, Table, TableBody, TableCell,
  TableHead, TableRow, Button, Grid, Stack, CircularProgress
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';

import { useDashboardStats, useAdminUsers, useAdminClubs } from '@/hooks/useAdmin';
import { ROUTES } from '@/constants';

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

/* ---------- Table Section Wrapper ---------- */
function TableSection({ title, onViewAll, loading, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#111827', letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500, fontSize: '0.92rem' }}>
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
      display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
      px: 3, py: 1, minWidth: 90,
      borderRadius: '12px',
      bgcolor: s.bg, color: s.color,
      fontSize: '1rem', fontWeight: 600, lineHeight: 1.2,
    }}>
      {s.label}
    </Box>
  );
}

/* ---------- Status Chip ---------- */
function StatusChip({ status }) {
  const map = {
    approved: { label: 'Active', color: '#15803D', bg: '#F0FDF4' },
    active: { label: 'Active', color: '#15803D', bg: '#F0FDF4' },
    pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
    rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
    suspended: { label: 'Suspended', color: '#DC2626', bg: '#FEE2E2' },
    inactive: { label: 'Inactive', color: '#8B98A5', bg: '#F6F8FA' },
  };
  const s = map[status] ?? { label: 'Inactive', color: '#8B98A5', bg: '#F6F8FA' };
  return (
    <Box sx={{
      display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
      px: 3, py: 1, minWidth: 90,
      borderRadius: '12px',
      bgcolor: s.bg, color: s.color,
      fontSize: '1rem', fontWeight: 600, lineHeight: 1.2,
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
      bgcolor: '#F0F2F5',
      color: '#475569',
      fontWeight: 600,
      fontSize: '0.9rem',
      py: 2.5,
      borderBottom: 'none',
      '&:first-of-type': { borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' },
      '&:last-of-type': { borderTopRightRadius: '12px', borderBottomRightRadius: '12px' },
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
      iconColor: '#16A34A',
      iconBg: '#DCFCE7',
    },
    {
      title: 'Active Organizations',
      value: statsLoading || isError ? '—' : clubsTotal.toLocaleString(),
      icon: BusinessCenterIcon,
      iconColor: '#F97316',
      iconBg: '#FFF7ED',
    },
    {
      title: 'Total Events',
      value: statsLoading || isError ? '—' : eventsTotal.toLocaleString(),
      icon: EventAvailableIcon,
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
    },
    {
      title: 'Pending Review',
      value: statsLoading || isError ? '—' : clubsPending.toLocaleString(),
      icon: HourglassTopRoundedIcon,
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
    },
    {
      title: 'Inactive Organizations',
      value: statsLoading || isError ? '—' : inactiveClubs.toLocaleString(),
      icon: TrendingUpIcon,
      iconColor: '#7C3AED',
      iconBg: '#F5F3FF',
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
            {usersData?.items
              ?.filter((u) => u.role !== 'admin')
              .slice(0, 5)
              .map((user) => (
              <TableRow
                key={user.id}
                hover
                sx={{
                  '&:last-child td': { borderBottom: 'none' },
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: '#FAFBFC' },
                }}
              >
                <TableCell sx={{ pl: 3, py: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      src={user.avatarUrl}
                      variant="rounded"
                      sx={{
                        width: 36, height: 36,
                        borderRadius: '10px',
                        bgcolor: '#F3F4F6',
                        color: '#374151',
                        fontSize: '0.92rem', fontWeight: 700,
                      }}
                    >
                      {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#000000', fontSize: '1rem' }}>
                      {user.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5 }}>{user.email}</TableCell>
                <TableCell sx={{ py: 2.5 }}><RoleChip role={user.role} /></TableCell>
              </TableRow>
            ))}
            {!usersData?.items?.filter((u) => u.role !== 'admin').length && (
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
                <TableCell sx={{ pl: 3, py: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      variant="rounded"
                      src={club.logo}
                      sx={{
                        width: 36, height: 36,
                        borderRadius: '10px',
                        bgcolor: '#F3F4F6',
                        color: '#374151',
                        fontSize: '0.92rem', fontWeight: 700,
                      }}
                    >
                      {club.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#000000', fontSize: '1rem' }}>
                      {club.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5 }}>
                  {club.contact?.email ?? club.owner?.email ?? '—'}
                </TableCell>
                <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {club.address || club.city || '—'}
                </TableCell>
                <TableCell sx={{ py: 2.5 }}><StatusChip status={club.status} /></TableCell>
                <TableCell sx={{ py: 2.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 700, textTransform: 'none', fontSize: '0.75rem',
                      borderRadius: '8px', borderColor: '#E5E7EB',
                      color: '#374151', py: 0.5,
                      '&:hover': { borderColor: '#F97316', color: '#F97316', bgcolor: 'rgba(249,115,22,0.05)' },
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
