import { Paper } from '@mui/material';

/**
 * Elevated surface for filters, tables, and page sections.
 */
export function ContentCard({ children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

export default ContentCard;
