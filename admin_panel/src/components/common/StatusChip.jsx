import { Chip } from '@mui/material';

const COLORS = {
  approved: 'success',
  active: 'success',
  pending: 'warning',
  rejected: 'error',
  suspended: 'error',
  disabled: 'error',
  hidden: 'default',
};

/** Colored status chip for club/user statuses. */
export function StatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={String(status).toUpperCase()}
      color={COLORS[status] ?? 'default'}
      variant={COLORS[status] ? 'filled' : 'outlined'}
    />
  );
}

export default StatusChip;
