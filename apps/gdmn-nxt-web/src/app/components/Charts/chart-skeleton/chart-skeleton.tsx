import { Skeleton, Stack } from '@mui/material';

/* eslint-disable-next-line */
export interface ChartSkeletonProps {}

export function ChartSkeleton(props: ChartSkeletonProps) {
  return (
    <>
      <Skeleton variant="text" height="15%" />
      <Skeleton variant="rectangular" height="100%" />
      <Skeleton variant="text" height="5%" />
    </>
  );
}

export default ChartSkeleton;
