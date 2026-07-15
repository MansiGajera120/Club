import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Avatar,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { PageHeader } from '@/components/ui';
import { StatusChip } from '@/components/common/StatusChip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAdminEvents, useDeleteEvent, useAdminClubs } from '@/hooks/useAdmin';
import { ROUTES, eventEditPath } from '@/constants';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/** Table header cell — shared style */
function TH({ children, ...props }) {
  return (
    <TableCell
      {...props}
      sx={{
        bgcolor: '#F0F2F5',
        color: '#475569',
        fontWeight: 600,
        fontSize: '0.9rem',
        borderBottom: 'none',
      '&:first-of-type': { borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' },
      '&:last-of-type': { borderTopRightRadius: '12px', borderBottomRightRadius: '12px' },
        py: 2.5,
        whiteSpace: 'nowrap',
        ...props.sx,
      }}
    >
      {children}
    </TableCell>
  );
}

/** Simple numbered pagination */
function SimplePagination({ page, count, limit, onChange }) {
  const totalPages = Math.max(1, Math.ceil(count / limit));
  if (totalPages <= 1) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton
        size="small"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        sx={{
          width: 32, height: 32, borderRadius: '8px',
          border: '1px solid #E5E7EB', bgcolor: '#fff',
          '&:hover': { borderColor: '#F97316', color: '#F97316' },
          '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
        <Box
          key={i}
          onClick={() => onChange(i)}
          sx={{
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '8px',
            border: `1px solid ${page === i ? '#F97316' : '#E5E7EB'}`,
            bgcolor: page === i ? '#F97316' : '#fff',
            color: page === i ? '#fff' : '#374151',
            fontSize: '0.92rem',
            fontWeight: page === i ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: '#F97316', color: page === i ? '#fff' : '#F97316' },
          }}
        >
          {i + 1}
        </Box>
      ))}

      <IconButton
        size="small"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        sx={{
          width: 32, height: 32, borderRadius: '8px',
          border: '1px solid #E5E7EB', bgcolor: '#fff',
          '&:hover': { borderColor: '#F97316', color: '#F97316' },
          '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}

export function EventsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data, isLoading } = useAdminEvents({ page: page + 1, limit });
  const events = data?.items ?? [];
  const total = data?.meta?.total ?? 0;

  const { data: clubsData } = useAdminClubs({ page: 1, limit: 100 });
  const clubNameById = useMemo(() => {
    const map = {};
    (clubsData?.items ?? []).forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [clubsData]);

  const deleteEvent = useDeleteEvent();
  const [target, setTarget] = useState(null);

  return (
    <Box>
      <PageHeader
        subtitle="Create, edit and manage events for organizations across the platform."
        actions={
          <Button
            id="add-event-btn"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.eventNew)}
            sx={{
              background: 'linear-gradient(135deg, #F97316, #FB923C)',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(249,115,22,0.30)',
              '&:hover': {
                background: 'linear-gradient(135deg, #EA6C0A, #F97316)',
                boxShadow: '0 6px 20px rgba(249,115,22,0.38)',
              },
            }}
          >
            Add Event
          </Button>
        }
      />

      {/* Table card */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #EEEFF2',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TH sx={{ pl: 3 }}>Event</TH>
                <TH>Organization</TH>
                <TH>Date</TH>
                <TH>Location</TH>
                <TH>Status</TH>
                <TH align="right" sx={{ pr: 3 }}>Actions</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                    <CircularProgress size={26} sx={{ color: '#F97316' }} />
                  </TableCell>
                </TableRow>
              )}

              {events.map((event, idx) => (
                <TableRow
                  key={event.id}
                  sx={{
                    '&:last-child td': { borderBottom: 'none' },
                    '&:hover': { bgcolor: '#FAFBFC' },
                    transition: 'background 0.12s',
                  }}
                >
                  {/* Event title with clean avatar */}
                  <TableCell sx={{ pl: 3, py: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 36, height: 36,
                          borderRadius: '10px',
                          fontSize: '0.92rem', fontWeight: 700,
                          bgcolor: '#F3F4F6',
                          color: '#374151',
                        }}
                      >
                        {event.title?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#000000' }}>
                        {event.title}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Organization */}
                  <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5 }}>
                    {clubNameById[event.club] || '—'}
                  </TableCell>

                  {/* Date */}
                  <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5, whiteSpace: 'nowrap' }}>
                    {event.startDate ? formatDate(event.startDate) : '—'}
                  </TableCell>

                  {/* Location */}
                  <TableCell
                    sx={{
                      color: '#000000', fontSize: '0.95rem', py: 2.5,
                      maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {event.location || '—'}
                  </TableCell>

                  {/* Status badge */}
                  <TableCell sx={{ py: 2.5 }}>
                    <StatusChip status={event.isActive ? 'active' : 'inactive'} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right" sx={{ py: 2.5, pr: 3 }}>
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      <Tooltip title="Edit event">
                        <IconButton
                          size="small"
                          onClick={() => navigate(eventEditPath(event.id))}
                          sx={{
                            width: 34, height: 34, borderRadius: '50%',
                            border: '1px solid #E5E7EB',
                            color: '#9CA3AF',
                            transition: 'all 0.15s',
                            '&:hover': {
                              borderColor: '#F97316', color: '#F97316',
                              bgcolor: 'rgba(249,115,22,0.06)',
                            },
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete event">
                        <IconButton
                          size="small"
                          onClick={() => setTarget(event)}
                          sx={{
                            width: 34, height: 34, borderRadius: '50%',
                            border: '1px solid #E5E7EB',
                            color: '#9CA3AF',
                            transition: 'all 0.15s',
                            '&:hover': {
                              borderColor: '#DC2626', color: '#DC2626',
                              bgcolor: 'rgba(220,38,38,0.06)',
                            },
                          }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {!isLoading && events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#9CA3AF' }}>
                    No events found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer pagination */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderTop: '1px solid #EEEFF2',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: '0.92rem', color: '#6B7280' }}>
            Showing{' '}
            <strong style={{ color: '#262525' }}>
              {events.length > 0 ? page * limit + 1 : 0}–{Math.min((page + 1) * limit, total)}
            </strong>{' '}
            out of <strong style={{ color: '#262525' }}>{total.toLocaleString()}</strong> results
          </Typography>
          <SimplePagination page={page} count={total} limit={limit} onChange={(p) => setPage(p)} />
        </Box>
      </Box>

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete Event"
        message={`Delete "${target?.title}"? This cannot be undone.`}
        destructive
        confirmLabel="Delete"
        loading={deleteEvent.isPending}
        onClose={() => setTarget(null)}
        onConfirm={() => deleteEvent.mutate(target.id, { onSuccess: () => setTarget(null) })}
      />
    </Box>
  );
}

export default EventsPage;
