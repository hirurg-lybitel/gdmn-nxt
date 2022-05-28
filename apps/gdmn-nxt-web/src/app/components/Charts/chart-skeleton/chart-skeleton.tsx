import { Skeleton } from '@mui/material';

/* eslint-disable-next-line */
export interface ChartSkeletonProps {}

export function ChartSkeleton(props: ChartSkeletonProps) {
  return (
    <>
      <Skeleton variant="text" height={100} />
      <Skeleton variant="rectangular" height={400} />
      <Skeleton variant="text" height={100} />
    </>
  );
}

export default ChartSkeleton;
