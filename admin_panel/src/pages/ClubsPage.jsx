import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Avatar,
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
  TableRow,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  Select,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

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
      bgcolor: '#EEF3FB !important',
      color: '#566072',
      fontWeight: 600,
      fontSize: '0.9rem',
      py: 2.5,
      borderBottom: '1px solid #E4EAF2 !important',
      '&:first-of-type': { borderTopLeftRadius: '12px' },
      '&:last-of-type': { borderTopRightRadius: '12px' },
      zIndex: '100 !important',
      ...props.sx,
    }}
  >
    {children}
  </TableCell>
);

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
          width: 32, height: 32, borderRadius: '8px', border: '1px solid #E4EAF2', bgcolor: '#fff',
          '&:hover': { borderColor: '#2563EB', color: '#2563EB' },
          '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
      </IconButton>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
        <Box
          key={i} onClick={() => onChange(i)}
          sx={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '8px', border: `1px solid ${page === i ? '#2563EB' : '#E4EAF2'}`,
            bgcolor: page === i ? '#2563EB' : '#fff', color: page === i ? '#fff' : '#566072',
            fontSize: '0.92rem', fontWeight: page === i ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
            '&:hover': { borderColor: '#2563EB', color: page === i ? '#fff' : '#2563EB' },
          }}
        >
          {i + 1}
        </Box>
      ))}
      <IconButton
        size="small" onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}
        sx={{
          width: 32, height: 32, borderRadius: '8px', border: '1px solid #E4EAF2', bgcolor: '#fff',
          '&:hover': { borderColor: '#2563EB', color: '#2563EB' }, '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}

export function ClubsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(() => searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedClub, setSelectedClub] = useState(null);

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

  const [anchorEl, setAnchorEl] = useState(null);
  const [active, setActive] = useState(null);
  const openMenu = (e, club) => { setAnchorEl(e.currentTarget); setActive(club); };
  const closeMenu = () => setAnchorEl(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => { setPage(0); setSearch(searchInput.trim()); }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const changeStatus = (newStatus, toastMessage) => {
    updateStatus.mutate({ id: active.id, body: { status: newStatus }, toastMessage });
    closeMenu();
  };

  const submitReject = () => {
    updateStatus.mutate(
      { id: active.id, body: { status: 'rejected', reason }, toastMessage: 'Club rejected — owner has been notified' },
      { onSuccess: () => { setRejectOpen(false); setReason(''); } }
    );
  };

  const menuActions = active ? getClubMenuActions(active.status) : [];
  const handleMenuAction = (action) => {
    if (action.dialog === 'reject') { closeMenu(); setRejectOpen(true); return; }
    if (action.dialog === 'delete') { closeMenu(); setDeleteOpen(true); return; }
    if (action.status) { changeStatus(action.status, action.toast); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        actionsAlign="left"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.clubNew)}>
            Add Organization
          </Button>
        }
      />
      <ContentCard sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2.5, borderBottom: '1px solid #E4EAF2', flexWrap: 'wrap' }}>
          <TextField
            id="clubs-search" size="small" placeholder="Search by name, city, or sport…"
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              flex: 1, minWidth: 200, maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff', borderRadius: '24px', '& fieldset': { borderColor: '#E4EAF2' },
                '&:hover fieldset': { borderColor: '#2563EB' }, '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1.5 },
              },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#8A93A3' }} /></InputAdornment>,
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <IconButton size="small" edge="end" onClick={() => setSearchInput('')}><ClearIcon sx={{ fontSize: 16 }} /></IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              id="clubs-status-select" value={status} displayEmpty
              onChange={(e) => { setPage(0); setStatus(e.target.value); }}
              sx={{
                bgcolor: '#fff', borderRadius: '10px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E4EAF2' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB', borderWidth: 1.5 },
              }}
              renderValue={(val) => (
                <Typography sx={{ fontSize: '0.95rem', color: val ? '#111827' : '#8A93A3' }}>
                  {val ? val[0].toUpperCase() + val.slice(1) : 'All statuses'}
                </Typography>
              )}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s || 'all'} value={s}>{s ? s[0].toUpperCase() + s.slice(1) : 'All statuses'}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TH>Name</TH>
                <TH>City</TH>
                <TH>Price</TH>
                <TH>Status</TH>
                <TH align="center">Featured</TH>
                <TH align="right">Favorites</TH>
                <TH align="right" sx={{ pr: 3 }}>Actions</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id} hover sx={{ transition: 'background 0.12s', '&:hover': { bgcolor: '#F8FBFE' } }}>
                  <TableCell sx={{ pl: 3, py: 2.5 }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: '#111827' }}>{club.name}</span>
                  </TableCell>
                  <TableCell sx={{ color: '#111827', fontSize: '0.95rem', py: 2.5 }}>{club.city ?? '—'}</TableCell>
                  <TableCell sx={{ color: '#111827', fontSize: '0.95rem', py: 2.5 }}>
                    {formatPrice(club.price, club.priceCurrency)}
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}><StatusChip status={club.status} /></TableCell>
                  <TableCell align="center" sx={{ py: 2.5 }}>
                    <Chip
                      size="small" clickable icon={club.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                      label={club.isFeatured ? 'Featured' : 'Feature'}
                      color={club.isFeatured ? 'primary' : 'default'} variant={club.isFeatured ? 'filled' : 'outlined'}
                      onClick={() => setFeatured.mutate({ id: club.id, isFeatured: !club.isFeatured })}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#111827', fontSize: '0.95rem', py: 2.5 }}>{club.favoritesCount ?? 0}</TableCell>
                  <TableCell align="right" sx={{ py: 2.5, pr: 3 }}>
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small" onClick={() => setSelectedClub(club)}
                          sx={{
                            width: 36, height: 36, borderRadius: '50%', border: '1px solid #E4EAF2', color: '#8A93A3',
                            transition: 'all 0.15s', '&:hover': { borderColor: '#2563EB', color: '#2563EB', bgcolor: 'rgba(37,99,235,0.06)' },
                          }}
                        >
                          <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small" onClick={(e) => openMenu(e, club)}
                        sx={{
                          width: 36, height: 36, borderRadius: '50%', border: '1px solid #E4EAF2', color: '#8A93A3',
                          transition: 'all 0.15s', '&:hover': { borderColor: '#566072', color: '#566072', bgcolor: 'rgba(86,96,114,0.06)' },
                        }}
                      >
                        <MoreVertIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && clubs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell>
                </TableRow>
              )}
              {!isLoading && clubs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>No clubs found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderTop: '1px solid #E4EAF2', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.92rem', color: '#566072' }}>
            Showing <strong style={{ color: '#111827' }}>{clubs.length > 0 ? page * limit + 1 : 0}–{Math.min((page + 1) * limit, total)}</strong> out of <strong style={{ color: '#111827' }}>{total.toLocaleString()}</strong> results
          </Typography>
          <SimplePagination page={page} count={total} limit={limit} onChange={(p) => setPage(p)} />
        </Box>
      </ContentCard>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => { closeMenu(); navigate(clubEditPath(active.id)); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Edit
        </MenuItem>
        {menuActions.map((action) => {
          const Icon = action.icon;
          return (
            <MenuItem key={action.key} onClick={() => handleMenuAction(action)} sx={action.destructive ? { color: 'error.main' } : undefined}>
              <ListItemIcon><Icon fontSize="small" color={action.destructive ? 'error' : 'inherit'} /></ListItemIcon>{action.label}
            </MenuItem>
          );
        })}
      </Menu>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject club</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline minRows={3} label="Reason for rejection" value={reason} onChange={(e) => setReason(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={reason.trim().length < 3 || updateStatus.isPending} onClick={submitReject}>Reject</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen} title="Delete Organization" message={`Delete "${active?.name}"? This action cannot be undone.`}
        destructive confirmLabel="Delete" loading={deleteClub.isPending}
        onClose={() => { setDeleteOpen(false); setActive(null); }}
        onConfirm={() => deleteClub.mutate(active.id, { onSuccess: () => { setDeleteOpen(false); setActive(null); } })}
      />

      {/* NEW FULL DETAILS DIALOG */}
      <Dialog
        open={Boolean(selectedClub)}
        onClose={() => setSelectedClub(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#111827' }}>
          Organization Details
        </DialogTitle>
        <DialogContent>
          {selectedClub && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2.5}>
                <Avatar
                  variant="rounded"
                  sx={{ width: 64, height: 64, borderRadius: '16px', bgcolor: '#EEF3FB', color: '#566072', fontWeight: 700, fontSize: '1.5rem' }}
                >
                  {selectedClub.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#111827' }}>
                    {selectedClub.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#566072' }}>
                    {selectedClub.sport ? `${selectedClub.sport} • ` : ''}
                    {selectedClub.city ? selectedClub.city : 'Location unknown'}
                  </Typography>
                </Box>
              </Stack>
              
              {selectedClub.description && (
                <Box sx={{ p: 2, bgcolor: '#F8FBFE', borderRadius: '12px', border: '1px solid #E4EAF2' }}>
                  <Typography variant="body2" sx={{ color: '#566072', lineHeight: 1.6 }}>
                    {selectedClub.description}
                  </Typography>
                </Box>
              )}

              <Box sx={{ p: 3, bgcolor: '#F8FBFE', borderRadius: '16px', border: '1px solid #E4EAF2' }}>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'flex-start', gap: 2 }}>
                    <Typography sx={{ color: '#566072', fontWeight: 500 }}>Category / Sport</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                        {selectedClub.sport || '—'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'flex-start', gap: 2 }}>
                    <Typography sx={{ color: '#566072', fontWeight: 500 }}>Location</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 600, color: '#111827', wordBreak: 'break-word' }}>
                        {selectedClub.address ? `${selectedClub.address}, ${selectedClub.city || ''}` : selectedClub.city || '—'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: '#566072', fontWeight: 500 }}>Contact Email</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 600, color: '#111827', wordBreak: 'break-all' }}>
                        {selectedClub.contact?.email || '—'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: '#566072', fontWeight: 500 }}>Contact Phone</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                        {selectedClub.contact?.phone || '—'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: '#566072', fontWeight: 500 }}>Target Audience</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                        {selectedClub.gender ? selectedClub.gender[0].toUpperCase() + selectedClub.gender.slice(1) : 'Any'}, Ages {selectedClub.ageMin ?? 0}-{selectedClub.ageMax ?? 100}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: '#566072', fontWeight: 500 }}>Registration Fee</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 700, color: '#111827' }}>
                        {formatPrice(selectedClub.price, selectedClub.priceCurrency)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: '#566072', fontWeight: 500 }}>Status</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <StatusChip status={selectedClub.status} />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedClub(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClubsPage;
