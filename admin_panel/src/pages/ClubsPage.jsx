import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

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
import { ROUTES, clubEditPath } from '@/constants';

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

export function ClubsPage() {
  const navigate = useNavigate();
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
      <PageHeader
        subtitle="Review listings, approve new clubs, and manage featured status."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.clubNew)}
          >
            Add Organization
          </Button>
        }
      />

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
              <TH>Name</TH>
              <TH>City</TH>
              <TH>Price</TH>
              <TH>Status</TH>
              <TH align="center">Featured</TH>
              <TH align="right">Favorites</TH>
              <TH align="right">Actions</TH>
            </TableRow>
          </TableHead>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id} hover sx={{ transition: 'background 0.12s', '&:hover': { bgcolor: '#FAFBFC' } }}>
                <TableCell sx={{ pl: 3, py: 2.5 }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem', color: '#000000' }}>{club.name}</span>
                </TableCell>
                <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5 }}>{club.city ?? '—'}</TableCell>
                <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5 }}>
                  {formatPrice(club.price, club.priceCurrency)}
                </TableCell>
                <TableCell sx={{ py: 2.5 }}>
                  <StatusChip status={club.status} />
                </TableCell>
                <TableCell align="center" sx={{ py: 2.5 }}>
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
                <TableCell align="right" sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5 }}>{club.favoritesCount ?? 0}</TableCell>
                <TableCell align="right" sx={{ py: 2.5, pr: 3 }}>
                  <IconButton onClick={(e) => openMenu(e, club)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {isLoading && clubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
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

      {/* Row actions — edit plus the status transitions valid for this club */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            const target = active;
            closeMenu();
            navigate(clubEditPath(target.id));
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
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
