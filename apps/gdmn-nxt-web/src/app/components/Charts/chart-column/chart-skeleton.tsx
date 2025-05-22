import { Skeleton } from '@mui/material';

export default function ChartSkeleton() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Skeleton
          variant="text"
          height={'40px'}
          width={'180px'}
          style={{ marginRight: '16px' }}
        />
        <Skeleton
          variant="rectangular"
          height={'40px'}
          width={'100px'}
          style={{ borderRadius: 'var(--border-radius)x' }}
        />
      </div>
      <div style={{ display: 'flex', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
        <Skeleton
          variant="rectangular"
          height={'40px'}
          width={'100%'}
          style={{ borderRadius: 'var(--border-radius)', minWidth: '192px' }}
        />
        <Skeleton
          variant="rectangular"
          height={'40px'}
          width={'100%'}
          style={{ borderRadius: 'var(--border-radius)', minWidth: '192px' }}
        />
        <Skeleton
          variant="rectangular"
          height={'40px'}
          width={'100%'}
          style={{ borderRadius: 'var(--border-radius)', minWidth: '192px' }}
        />
      </div>
      <Skeleton variant="rectangular" height={'290px'} />
      <Skeleton
        variant="rectangular"
        height={'40px'}
        style={{ borderRadius: 'var(--border-radius)' }}
      />
    </>
  );
}
