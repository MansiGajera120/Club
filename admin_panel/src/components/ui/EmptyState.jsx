import { Box, Button, Typography } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

/**
 * Friendly empty/placeholder state with an icon, title, message and an optional
 * call-to-action. Mirrors the Flutter app's EmptyState.
 */
export function EmptyState({
  icon: Icon = InboxRoundedIcon,
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        gap: 1.5,
      }}
    >
      <Icon sx={{ fontSize: 56, color: 'primary.main' }} />
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {message}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;
