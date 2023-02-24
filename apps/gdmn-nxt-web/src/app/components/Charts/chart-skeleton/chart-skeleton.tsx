import { Skeleton } from '@mui/material';

/* eslint-disable-next-line */
export interface ChartSkeletonProps {}

export function ChartSkeleton(props: ChartSkeletonProps) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" height={'40px'} width={'180px'} />
        <Skeleton variant="rectangular" height={'60px'} width={'100px'} style={{ borderRadius: '12px' }} />
      </div>
      <div style={{ display: 'flex', marginBottom: '40px' }}>
        <Skeleton variant="rectangular" height={'60px'} width={'100%'} style={{ marginLeft: '10px', borderRadius: '12px' }}/>
        <Skeleton variant="rectangular" height={'60px'} width={'100%'} style={{ marginLeft: '10px', borderRadius: '12px' }}/>
        <Skeleton variant="rectangular" height={'60px'} width={'100%'} style={{ marginLeft: '10px', borderRadius: '12px' }}/>
      </div>
      <Skeleton variant="rectangular" height={'70%'} />
      <Skeleton variant="rectangular" height={'80px'} style={{ borderRadius: '12px' }}/>
    </>
  );
}

export default ChartSkeleton;
