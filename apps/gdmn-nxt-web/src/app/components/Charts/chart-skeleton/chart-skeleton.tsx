import { Skeleton } from '@mui/material';

/* eslint-disable-next-line */
export interface ChartSkeletonProps {}

export function ChartSkeleton(props: ChartSkeletonProps) {
  return (
    <>
      <Skeleton variant="rectangular" height={'70px'} style={{ marginBottom: '10px' }} />
      <Skeleton variant="rectangular" height={'65px'} style={{ marginBottom: '30px' }} />
      <Skeleton variant="rectangular" height={'70%'} />
      <Skeleton variant="rectangular" height={'70px'}/>
    </>
  );
}

export default ChartSkeleton;
