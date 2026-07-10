import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import { PageHeader, ContentCard } from '@/components/ui';
import { StatusChip } from '@/components/common/StatusChip';
import { useAdminUsers, useSetUserStatus } from '@/hooks/useAdmin';

const ROLE_LABELS = { parent: 'User', club_owner: 'Club Owner', admin: 'Admin' };

export function UsersPage() {
  const [role, setRole] = useState('');
  const [status, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const params = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
    page: page + 1,
    limit,
  };
  const { data, isLoading } = useAdminUsers(params);
  const users = data?.items ?? [];
  const total = data?.meta?.total ?? 0;

  const setStatus = useSetUserStatus();

  // Debounced live search — same behaviour as the mobile app: results update
  // ~350ms after typing stops, with no need to press Enter.
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  return (
    <Box>
      <PageHeader subtitle="Manage parents, club owners, and account access." />

      <ContentCard sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          <TextField
            select
            fullWidth={false}
            label="Role"
            size="small"
            value={role}
            onChange={(e) => {
              setPage(0);
              setRole(e.target.value);
            }}
            sx={{ width: { xs: '100%', sm: 220 }, flexShrink: 0 }}
          >
            <MenuItem value="">All roles</MenuItem>
            <MenuItem value="parent">User</MenuItem>
            <MenuItem value="club_owner">Club Owner</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            select
            fullWidth={false}
            label="Status"
            size="small"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatusFilter(e.target.value);
            }}
            sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="disabled">Disabled</MenuItem>
          </TextField>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or email…"
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
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Enabled</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {user.name}
                    {user.isEmailVerified && (
                      <Tooltip title="Email verified">
                        <VerifiedIcon color="primary" sx={{ fontSize: 16 }} />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip size="small" label={ROLE_LABELS[user.role] ?? user.role} />
                </TableCell>
                <TableCell>
                  <StatusChip status={user.status} />
                </TableCell>
                <TableCell align="center">
                  <Tooltip
                    title={
                      user.role === 'admin'
                        ? 'Admin accounts cannot be disabled'
                        : ''
                    }
                  >
                    <span>
                      <Switch
                        checked={user.status === 'active'}
                        disabled={user.role === 'admin'}
                        onChange={(e) =>
                          setStatus.mutate({
                            id: user.id,
                            status: e.target.checked ? 'active' : 'disabled',
                          })
                        }
                      />
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No users found.
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
    </Box>
  );
}

export default UsersPage;
