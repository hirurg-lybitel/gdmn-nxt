import { Skeleton } from '@mui/material';

/* eslint-disable-next-line */
export interface ChartSkeletonProps {}

export function ChartSkeleton(props: ChartSkeletonProps) {
  return (
    <div style={{ flex: 1 }}>
      <Skeleton variant="text" height="15%" />
      <Skeleton variant="rectangular" height="80%" />
      <Skeleton variant="text" height="5%" />
    </div>
  );
}

export default ChartSkeleton;
