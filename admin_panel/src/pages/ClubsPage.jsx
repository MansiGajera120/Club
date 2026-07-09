import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import { PageHeader, ContentCard } from '@/components/ui';
import { StatusChip } from '@/components/common/StatusChip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  useAdminClubs,
  useUpdateClubStatus,
  useSetClubFeatured,
  useDeleteClub,
} from '@/hooks/useAdmin';
import { getClubMenuActions } from '@/utils/clubActions';

const STATUS_OPTIONS = ['', 'pending', 'approved', 'rejected', 'suspended', 'hidden'];

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

/** Format a club price with the right symbol and locale grouping. */
function formatPrice(value, currency) {
  if (!value || value <= 0) return 'Free';
  const raw = (currency || '').toUpperCase();
  const code = !raw || raw === 'USD' ? 'INR' : raw;
  const symbol = CURRENCY_SYMBOLS[code];
  const grouped = value.toLocaleString(code === 'INR' ? 'en-IN' : 'en-US');
  return symbol ? `${symbol}${grouped}` : `${code} ${grouped}`;
}

export function ClubsPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(() => searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const params = {
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
    page: page + 1,
    limit,
  };
  const { data, isLoading } = useAdminClubs(params);
  const clubs = data?.items ?? [];
  const total = data?.meta?.total ?? 0;

  const updateStatus = useUpdateClubStatus();
  const setFeatured = useSetClubFeatured();
  const deleteClub = useDeleteClub();

  // Row action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [active, setActive] = useState(null);
  const openMenu = (e, club) => {
    setAnchorEl(e.currentTarget);
    setActive(club);
  };
  const closeMenu = () => setAnchorEl(null);

  // Reject dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Debounced live search — same behaviour as the mobile app: results update
  // ~350ms after typing stops, with no need to press Enter.
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const changeStatus = (newStatus, toastMessage) => {
    updateStatus.mutate({
      id: active.id,
      body: { status: newStatus },
      toastMessage,
    });
    closeMenu();
  };

  const submitReject = () => {
    updateStatus.mutate(
      {
        id: active.id,
        body: { status: 'rejected', reason },
        toastMessage: 'Club rejected — owner has been notified',
      },
      {
        onSuccess: () => {
          setRejectOpen(false);
          setReason('');
        },
      }
    );
  };

  const menuActions = active ? getClubMenuActions(active.status) : [];

  const handleMenuAction = (action) => {
    if (action.dialog === 'reject') {
      closeMenu();
      setRejectOpen(true);
      return;
    }
    if (action.dialog === 'delete') {
      closeMenu();
      setDeleteOpen(true);
      return;
    }
    if (action.status) {
      changeStatus(action.status, action.toast);
    }
  };

  return (
    <Box>
      <PageHeader subtitle="Review listings, approve new clubs, and manage featured status." />

      <ContentCard sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          <TextField
            select
            fullWidth={false}
            label="Status"
            size="small"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value);
            }}
            sx={{ width: { xs: '100%', sm: 220 }, flexShrink: 0 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s || 'all'} value={s}>
                {s ? s[0].toUpperCase() + s.slice(1) : 'All statuses'}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, city, or sport…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="disabled" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label="Clear search"
                      onClick={() => setSearchInput('')}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>
        </Stack>
      </ContentCard>

      <ContentCard>
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Featured</TableCell>
              <TableCell align="right">Favorites</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id} hover>
                <TableCell>{club.name}</TableCell>
                <TableCell>{club.city ?? '—'}</TableCell>
                <TableCell>
                  {formatPrice(club.price, club.priceCurrency)}
                </TableCell>
                <TableCell>
                  <StatusChip status={club.status} />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    clickable
                    icon={club.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                    label={club.isFeatured ? 'Featured' : 'Feature'}
                    color={club.isFeatured ? 'primary' : 'default'}
                    variant={club.isFeatured ? 'filled' : 'outlined'}
                    onClick={() =>
                      setFeatured.mutate({
                        id: club.id,
                        isFeatured: !club.isFeatured,
                      })
                    }
                  />
                </TableCell>
                <TableCell align="right">{club.favoritesCount ?? 0}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => openMenu(e, club)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && clubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No clubs found.
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

      {/* Row actions — only options valid for the club's current status */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        {menuActions.map((action) => {
          const Icon = action.icon;
          return (
            <MenuItem
              key={action.key}
              onClick={() => handleMenuAction(action)}
              sx={action.destructive ? { color: 'error.main' } : undefined}
            >
              <ListItemIcon>
                <Icon fontSize="small" color={action.destructive ? 'error' : 'inherit'} />
              </ListItemIcon>
              {action.label}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Reject reason dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject club</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setRejectOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={reason.trim().length < 3 || updateStatus.isPending}
            onClick={submitReject}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete club"
        message={`Delete "${active?.name}"? This also removes its events, favorites and images. This cannot be undone.`}
        destructive
        confirmLabel="Delete"
        loading={deleteClub.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          deleteClub.mutate(active.id, { onSuccess: () => setDeleteOpen(false) })
        }
      />
    </Box>
  );
}

export default ClubsPage;
