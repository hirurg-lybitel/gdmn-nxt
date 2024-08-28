import { Skeleton } from "@mui/material";

export default function ChartSkeleton() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'8px'}}>
        <Skeleton variant="text" height={'30px'} width={'180px'} />
        <Skeleton variant="rectangular" height={'55px'} width={'100px'} style={{ borderRadius: 'var(--border-radius)x' }} />
      </div>
      <div style={{ display: 'flex', marginBottom: '30px' }}>
        <Skeleton variant="rectangular" height={'60px'} width={'100%'} style={{ borderRadius: 'var(--border-radius)' }}/>
        <Skeleton variant="rectangular" height={'60px'} width={'100%'} style={{ marginLeft: '10px', borderRadius: 'var(--border-radius)' }}/>
        <Skeleton variant="rectangular" height={'60px'} width={'100%'} style={{ marginLeft: '10px', borderRadius: 'var(--border-radius)' }}/>
      </div>
      <Skeleton variant="rectangular" height={'70%'} />
      <Skeleton variant="rectangular" height={'70px'} style={{ borderRadius: 'var(--border-radius)' }}/>
    </>
  )
}
