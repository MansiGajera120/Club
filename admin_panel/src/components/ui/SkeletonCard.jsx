import { Card, CardContent, Skeleton, Stack } from '@mui/material';

/** Loading placeholder shaped like a content card. */
export function SkeletonCard({ lines = 3 }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.25}>
          <Skeleton variant="text" width="45%" height={28} />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="text" width={i === lines - 1 ? '70%' : '100%'} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SkeletonCard;
