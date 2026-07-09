import { Box, Stack, Typography } from '@mui/material';

/**
 * Standard page title block with optional subtitle and right-aligned actions.
 */
export function PageHeader({ title, subtitle, eyebrow, actions }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        {eyebrow && (
          <Typography
            variant="caption"
            color="primary"
            fontWeight={700}
            sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}
          >
            {eyebrow}
          </Typography>
        )}
        {title && (
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: title ? 0.75 : 0, maxWidth: 640 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
    </Stack>
  );
}

export default PageHeader;
