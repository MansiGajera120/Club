import { Box } from '@mui/material';

/**
 * Pill-style status badge matching the Thrive Tracker reference design.
 * Supports: active, inactive, disabled, approved, pending, rejected,
 *           suspended, hidden, at-risk, and any unknown status (gray fallback).
 */

const STATUS_MAP = {
  active: {
    label: 'Active',
    color: '#15803D',
    bg: '#F0FDF4',
  },
  approved: {
    label: 'Active',
    color: '#15803D',
    bg: '#F0FDF4',
  },
  inactive: {
    label: 'Inactive',
    color: '#8A93A3',
    bg: '#F8FBFE',
  },
  disabled: {
    label: 'Inactive',
    color: '#566072',
    bg: '#EEF3FB',
  },
  hidden: {
    label: 'Hidden',
    color: '#566072',
    bg: '#EEF3FB',
  },
  pending: {
    label: 'Pending',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  rejected: {
    label: 'Rejected',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  suspended: {
    label: 'Suspended',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  'at-risk': {
    label: 'At Risk',
    color: '#B91C1C',
    bg: '#FEE2E2',
  },
};

/**
 * StatusChip — pill-style badge.
 * @param {string} status  - One of the keys in STATUS_MAP (case-insensitive).
 * @param {string} [label] - Optional override for the displayed label.
 */
export function StatusChip({ status, label }) {
  const key = status?.toLowerCase?.() ?? '';
  const cfg = STATUS_MAP[key] ?? {
    label: label ?? status ?? '—',
    color: '#566072',
    bg: '#EEF3FB',
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 1,
        minWidth: 90,
        borderRadius: '12px',
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: '0.9rem',
        fontWeight: 600,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        userSelect: 'none',
      }}
    >
      {label ?? cfg.label}
    </Box>
  );
}

export default StatusChip;
