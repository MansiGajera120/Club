import { Box, Card, CardActionArea, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { brand, gradients } from '@/theme/tokens';

/**
 * Tappable shortcut card for common admin tasks.
 */
export function QuickActionCard({ title, description, icon: Icon, onClick, accent = brand.primary }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderColor: 'divider',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          borderColor: `${accent}44`,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%', p: 0 }}>
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              background: gradients.brandSoft,
              color: accent,
            }}
          >
            <Icon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
              {description}
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ color: 'text.disabled', mt: 0.5 }} />
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default QuickActionCard;
