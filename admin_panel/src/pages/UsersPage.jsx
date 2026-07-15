import { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
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
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Select,
  FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import VerifiedIcon from '@mui/icons-material/Verified';

import { StatusChip } from '@/components/common/StatusChip';
import { useAdminUsers, useSetUserStatus } from '@/hooks/useAdmin';

const ROLE_LABELS = { parent: 'User', club_owner: 'Club Owner', admin: 'Admin' };

/** Table header cell */
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

/** Simple numbered pagination buttons */
function SimplePagination({ page, count, limit, onChange }) {
  const totalPages = Math.max(1, Math.ceil(count / limit));
  if (totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <IconButton
        size="small"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          bgcolor: '#fff',
          '&:hover': { borderColor: '#F97316', color: '#F97316' },
          '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        const pageNum = i; // simplified: show first 5 pages
        return (
          <Box
            key={pageNum}
            onClick={() => onChange(pageNum)}
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: `1px solid ${page === pageNum ? '#F97316' : '#E5E7EB'}`,
              bgcolor: page === pageNum ? '#F97316' : '#fff',
              color: page === pageNum ? '#fff' : '#374151',
              fontSize: '0.92rem',
              fontWeight: page === pageNum ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#F97316',
                color: page === pageNum ? '#fff' : '#F97316',
              },
            }}
          >
            {pageNum + 1}
          </Box>
        );
      })}

      <IconButton
        size="small"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          bgcolor: '#fff',
          '&:hover': { borderColor: '#F97316', color: '#F97316' },
          '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}

export function UsersPage() {
  const [role, setRole] = useState('');
  const [status, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const limit = 10;

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

  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  return (
    <Box>
      {/* Filter bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2.5,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <TextField
          id="users-search"
          size="small"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 200,
            maxWidth: 340,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#fff',
              borderRadius: '24px',
              '& fieldset': { borderColor: '#E5E7EB' },
              '&:hover fieldset': { borderColor: '#F97316' },
              '&.Mui-focused fieldset': { borderColor: '#F97316', borderWidth: 1.5 },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
              </InputAdornment>
            ),
            endAdornment: searchInput ? (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" onClick={() => setSearchInput('')}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {/* Status select */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            id="users-status-select"
            value={status}
            displayEmpty
            onChange={(e) => {
              setPage(0);
              setStatusFilter(e.target.value);
            }}
            sx={{
              bgcolor: '#fff',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#F97316',
                borderWidth: 1.5,
              },
            }}
            renderValue={(val) => (
              <Typography sx={{ fontSize: '0.95rem', color: val ? '#262525' : '#9CA3AF' }}>
                {val === 'active'
                  ? 'Active'
                  : val === 'disabled'
                  ? 'Disabled'
                  : 'Select Status'}
              </Typography>
            )}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="disabled">Disabled</MenuItem>
          </Select>
        </FormControl>

        {/* Role select */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            id="users-role-select"
            value={role}
            displayEmpty
            onChange={(e) => {
              setPage(0);
              setRole(e.target.value);
            }}
            sx={{
              bgcolor: '#fff',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F97316' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#F97316',
                borderWidth: 1.5,
              },
            }}
            renderValue={(val) => (
              <Typography sx={{ fontSize: '0.95rem', color: val ? '#262525' : '#9CA3AF' }}>
                {val === 'parent'
                  ? 'User'
                  : val === 'club_owner'
                  ? 'Club Owner'
                  : val === 'admin'
                  ? 'Admin'
                  : 'Select Role'}
              </Typography>
            )}
          >
            <MenuItem value="">All roles</MenuItem>
            <MenuItem value="parent">User</MenuItem>
            <MenuItem value="club_owner">Club Owner</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
                <TH sx={{ pl: 3 }}>Name</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Join Date</TH>
                <TH>Status</TH>
                <TH align="center">Enabled</TH>
                <TH align="center">Action</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 7 }}>
                    <CircularProgress size={26} sx={{ color: '#F97316' }} />
                  </TableCell>
                </TableRow>
              )}

              {users.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    '&:last-child td': { borderBottom: 'none' },
                    '&:hover': { bgcolor: '#FAFBFC' },
                    transition: 'background 0.12s',
                  }}
                >
                  {/* Name */}
                  <TableCell sx={{ pl: 3, py: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        src={user.avatarUrl}
                        variant="rounded"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          bgcolor: '#F3F4F6',
                          color: '#374151',
                        }}
                      >
                        {user.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Stack direction="row" alignItems="center" spacing={0.4}>
                        <Typography
                          sx={{ fontWeight: 600, fontSize: '1rem', color: '#000000' }}
                        >
                          {user.name}
                        </Typography>
                        {user.isEmailVerified && (
                          <Tooltip title="Email verified">
                            <VerifiedIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  </TableCell>

                  {/* Email */}
                  <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5 }}>
                    {user.email}
                  </TableCell>

                  {/* Role */}
                  <TableCell sx={{ py: 2.5 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        px: 1.5,
                        py: 0.4,
                        borderRadius: '20px',
                        bgcolor:
                          user.role === 'admin'
                            ? 'rgba(124,58,237,0.1)'
                            : user.role === 'club_owner'
                            ? 'rgba(2,132,199,0.1)'
                            : '#F3F4F6',
                        color:
                          user.role === 'admin'
                            ? '#7C3AED'
                            : user.role === 'club_owner'
                            ? '#0284C7'
                            : '#6B7280',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Box>
                  </TableCell>

                  {/* Join date */}
                  <TableCell sx={{ color: '#000000', fontSize: '0.95rem', py: 2.5, whiteSpace: 'nowrap' }}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>

                  {/* Status */}
                  <TableCell sx={{ py: 2.5 }}>
                    <StatusChip status={user.status} />
                  </TableCell>

                  {/* Enabled toggle */}
                  <TableCell align="center" sx={{ py: 2.5 }}>
                    <Tooltip
                      title={
                        user.role === 'admin' ? 'Admin accounts cannot be disabled' : ''
                      }
                    >
                      <span>
                        <Switch
                          checked={user.status === 'active'}
                          disabled={user.role === 'admin'}
                          size="small"
                          onChange={(e) =>
                            setStatus.mutate({
                              id: user.id,
                              status: e.target.checked ? 'active' : 'disabled',
                            })
                          }
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#F97316' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              bgcolor: '#F97316',
                            },
                          }}
                        />
                      </span>
                    </Tooltip>
                  </TableCell>

                  {/* Action */}
                  <TableCell align="center" sx={{ py: 2.5 }}>
                    <Tooltip title="View user">
                      <IconButton
                        size="small"
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          border: '1px solid #E5E7EB',
                          color: '#9CA3AF',
                          transition: 'all 0.15s',
                          '&:hover': {
                            borderColor: '#F97316',
                            color: '#F97316',
                            bgcolor: 'rgba(249,115,22,0.06)',
                          },
                        }}
                      >
                        <RemoveRedEyeOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {!isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#9CA3AF' }}>
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer: showing x of y + pagination */}
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
              {users.length > 0 ? page * limit + 1 : 0}–{Math.min((page + 1) * limit, total)}
            </strong>{' '}
            out of <strong style={{ color: '#262525' }}>{total.toLocaleString()}</strong> results
          </Typography>
          <SimplePagination
            page={page}
            count={total}
            limit={limit}
            onChange={(p) => setPage(p)}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default UsersPage;
