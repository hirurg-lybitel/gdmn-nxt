import styles from './chart-skeleton.module.less';
import { Box, Skeleton } from '@mui/material';

export default function ChartSkeleton() {
  const getMas = (size: number) => {
    const mas = [];
    for (let i = 0;i < size;i++) {
      mas.push(i);
    }
    return mas;
  };
  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column', paddingLeft: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton
          variant="text"
          height={'30px'}
          width={'135px'}
        />
      </div>
      <Box style={{ display: 'flex', height: '100%' }} flexDirection={{ xs: 'column-reverse', sm: 'row' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: { xs: 'auto', sm: '260px' },
            maxWidth: { xs: 'auto', sm: '40%' },
            paddingTop: '20px',
            paddingRight: '20px'
          }}
        >
          {getMas(8).map((item, index) => {
            return (
              <Skeleton
                key={item}
                variant="text"
                height={'30px'}
                width={'100%'}
                style={{ marginBottom: '5px' }}
              />
            );
          })}
        </Box>
        <div className={styles['container']}>
          <div className={styles['square']}>
            <div className={styles['content']}>
              <div className={styles['body']}>
                <Skeleton
                  variant="circular"
                  height={'100%'}
                  width={'auto'}
                />
              </div>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
}
