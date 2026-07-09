import { Box, Typography } from '@mui/material';

/**
 * Section heading used inside dashboard panels.
 */
export function SectionHeading({ title, subtitle, sx }) {
  return (
    <Box sx={{ ...sx }}>
      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1.25, lineHeight: 1.65, maxWidth: 560 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default SectionHeading;
