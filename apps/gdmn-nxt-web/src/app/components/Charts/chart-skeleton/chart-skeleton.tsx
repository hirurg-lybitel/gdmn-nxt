import { Skeleton } from '@mui/material';

/* eslint-disable-next-line */
export interface ChartSkeletonProps {}

export function ChartSkeleton(props: ChartSkeletonProps) {
  return (
    <>
      <Skeleton variant="text" height={'10%'} />
      <Skeleton variant="rectangular" height={'80%'} />
      <Skeleton variant="text" height={'10%'} />
    </>
  );
}

export default ChartSkeleton;
