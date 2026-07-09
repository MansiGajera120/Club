import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

const PLACEHOLDER_STATS = [
  { label: 'Total Clubs', value: '—' },
  { label: 'Pending Approval', value: '—' },
  { label: 'Total Users', value: '—' },
  { label: 'Events', value: '—' },
];

/**
 * Dashboard landing page. Statistic cards and charts are wired to real data in
 * Phase 10; the layout establishes the structure now.
 */
export function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={800}>
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        {PLACEHOLDER_STATS.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default DashboardPage;
