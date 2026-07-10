import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import { PageHeader, ContentCard } from '@/components/ui';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAdminEvents, useDeleteEvent, useAdminClubs } from '@/hooks/useAdmin';
import { ROUTES, eventEditPath } from '@/constants';

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export function EventsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useAdminEvents({ page: page + 1, limit });
  const events = data?.items ?? [];
  const total = data?.meta?.total ?? 0;

  // Map club id → name so each event shows its organization.
  const { data: clubsData } = useAdminClubs({ page: 1, limit: 100 });
  const clubNameById = useMemo(() => {
    const map = {};
    (clubsData?.items ?? []).forEach((c) => {
      map[c.id] = c.name;
    });
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
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.eventNew)}
          >
            Add Event
          </Button>
        }
      />

      <ContentCard>
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Starts</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell>{event.title}</TableCell>
                <TableCell>{clubNameById[event.club] || '—'}</TableCell>
                <TableCell>{formatDate(event.startDate)}</TableCell>
                <TableCell>{event.location || '—'}</TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={event.isActive ? 'Active' : 'Inactive'}
                    color={event.isActive ? 'success' : 'default'}
                    variant={event.isActive ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit event">
                    <IconButton onClick={() => navigate(eventEditPath(event.id))}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete event">
                    <IconButton color="error" onClick={() => setTarget(event)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {isLoading && events.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && events.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
        </TableContainer>
      </ContentCard>

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete event"
        message={`Delete "${target?.title}"? This cannot be undone.`}
        destructive
        confirmLabel="Delete"
        loading={deleteEvent.isPending}
        onClose={() => setTarget(null)}
        onConfirm={() =>
          deleteEvent.mutate(target.id, { onSuccess: () => setTarget(null) })
        }
      />
    </Box>
  );
}

export default EventsPage;
