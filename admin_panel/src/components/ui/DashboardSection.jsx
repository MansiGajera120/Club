import { Box, Typography } from '@mui/material';

/**
 * Grouped section on the dashboard with a title and optional subtitle.
 */
export function DashboardSection({ title, subtitle, children, sx }) {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {children}
    </Box>
  );
}

export default DashboardSection;
