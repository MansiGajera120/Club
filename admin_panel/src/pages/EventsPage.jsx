import { useState } from 'react';
import {
  Box,
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

import { PageHeader, ContentCard } from '@/components/ui';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAdminEvents, useDeleteEvent } from '@/hooks/useAdmin';

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export function EventsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useAdminEvents({ page: page + 1, limit });
  const events = data?.items ?? [];
  const total = data?.meta?.total ?? 0;

  const deleteEvent = useDeleteEvent();
  const [target, setTarget] = useState(null);

  return (
    <Box>
      <PageHeader subtitle="View and manage events published by clubs across the platform." />

      <ContentCard>
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
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
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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
